import { openDB } from 'idb'

const DB_NAME    = 'harmonyx_cache'
const DB_VERSION = 2            // bumped: adds songMetadata + userData stores
const MAX_CACHED_SONGS  = 100
const MAX_CACHE_SIZE_MB = 500

// ── Open / upgrade DB ─────────────────────────────────────────────────────────
export const initCacheDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // v1 stores — create on fresh install
      if (oldVersion < 1) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id' })
        songStore.createIndex('playCount', 'playCount')
        songStore.createIndex('lastPlayed', 'lastPlayed')

        const audioStore = db.createObjectStore('offlineAudio', { keyPath: 'songId' })
        audioStore.createIndex('cachedAt', 'cachedAt')
        audioStore.createIndex('size', 'size')

        db.createObjectStore('playStats',  { keyPath: 'songId' })
        db.createObjectStore('syncQueue',  { keyPath: 'id', autoIncrement: true })
      }

      // v2 stores — offline metadata cache
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('songMetadata'))
          db.createObjectStore('songMetadata', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('userData'))
          db.createObjectStore('userData', { keyPath: 'key' })
      }
    },
  })
}

// ── Play-count tracking ───────────────────────────────────────────────────────
export const recordSongPlay = async (songId) => {
  try {
    const db = await initCacheDB()
    const tx = db.transaction(['playStats'], 'readwrite')
    let stats = await tx.objectStore('playStats').get(songId)
    if (!stats) stats = { songId, playCount: 0, lastPlayed: Date.now() }
    stats.playCount += 1
    stats.lastPlayed = Date.now()
    await tx.objectStore('playStats').put(stats)
    await tx.done
  } catch {}
}

export const getMostPlayedSongs = async (limit = 20) => {
  const db    = await initCacheDB()
  const stats = await db.getAllFromIndex('playStats', 'playCount')
  return stats
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
    .map((s) => s.songId)
}

// ── Audio file caching (Cache API + IndexedDB tracking) ───────────────────────
export const cacheAudioFile = async (songId, audioUrl, sizeMB = 4) => {
  try {
    const db          = await initCacheDB()
    const cachedFiles = await db.getAllFromIndex('offlineAudio', 'cachedAt')
    let totalSize     = cachedFiles.reduce((sum, f) => sum + (f.size || 0), 0)

    while (cachedFiles.length >= MAX_CACHED_SONGS || totalSize + sizeMB > MAX_CACHE_SIZE_MB) {
      const mostPlayed = await getMostPlayedSongs(MAX_CACHED_SONGS)
      const toEvict    = cachedFiles.find((f) => !mostPlayed.includes(f.songId))
      if (!toEvict) break
      await evictCachedSong(toEvict.songId)
      totalSize -= toEvict.size || 0
      cachedFiles.splice(cachedFiles.indexOf(toEvict), 1)
    }

    const cache    = await caches.open('audio-cache')
    const response = await fetch(audioUrl)
    if (!response.ok) return
    await cache.put(songId, response.clone())
    await db.put('offlineAudio', { songId, cachedAt: Date.now(), size: sizeMB, url: audioUrl })
  } catch (e) { console.warn('cacheAudioFile failed:', e) }
}

export const getCachedAudio = async (songId) => {
  try {
    const cache    = await caches.open('audio-cache')
    const response = await cache.match(String(songId))
    if (response) return URL.createObjectURL(await response.blob())
  } catch {}
  return null
}

export const isSongCached = async (songId) => {
  try {
    const db = await initCacheDB()
    return !!(await db.get('offlineAudio', String(songId)))
  } catch { return false }
}

export const evictCachedSong = async (songId) => {
  try {
    const db    = await initCacheDB()
    const cache = await caches.open('audio-cache')
    await cache.delete(String(songId))
    await db.delete('offlineAudio', songId)
  } catch {}
}

// ── Song-metadata cache (offline browse) ─────────────────────────────────────
export const cacheSongsList = async (songs = []) => {
  try {
    const db = await initCacheDB()
    const tx = db.transaction('songMetadata', 'readwrite')
    await Promise.all([...songs.map((s) => tx.objectStore('songMetadata').put(s)), tx.done])
  } catch (e) { console.warn('cacheSongsList failed:', e) }
}

export const getCachedSongsList = async () => {
  try {
    return (await (await initCacheDB()).getAll('songMetadata')) || []
  } catch { return [] }
}

// ── Generic per-user data cache (liked songs, playlists, etc.) ────────────────
export const cacheUserData = async (uid, dataKey, data) => {
  try {
    const db = await initCacheDB()
    await db.put('userData', { key: `${uid}_${dataKey}`, data, updatedAt: Date.now() })
  } catch (e) { console.warn('cacheUserData failed:', e) }
}

export const getCachedUserData = async (uid, dataKey) => {
  try {
    const record = await (await initCacheDB()).get('userData', `${uid}_${dataKey}`)
    return record?.data ?? null
  } catch { return null }
}

// ── Auto-cache most-played songs ─────────────────────────────────────────────
export const autoCacheMostPlayed = async (songsMap, qualityUrlGetter) => {
  const ids = await getMostPlayedSongs(20)
  for (const id of ids) {
    if (await isSongCached(id)) continue
    const song = songsMap[id]
    if (!song) continue
    await cacheAudioFile(id, qualityUrlGetter(song, '64'), 3)
  }
}

// ── Offline sync queue (replay deferred writes when back online) ──────────────
export const addToSyncQueue = async (action) => {
  const db = await initCacheDB()
  await db.add('syncQueue', { ...action, createdAt: Date.now() })
}

export const processSyncQueue = async (handlers = {}) => {
  const db    = await initCacheDB()
  const queue = await db.getAll('syncQueue')
  for (const item of queue) {
    try {
      if (handlers[item.type]) await handlers[item.type](item)
      await db.delete('syncQueue', item.id)
    } catch (e) { console.error('Sync failed:', item.id, e) }
  }
}
