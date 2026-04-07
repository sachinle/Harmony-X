import { openDB } from 'idb'

const DB_NAME = 'harmonyx_cache'
const DB_VERSION = 1
const MAX_CACHED_SONGS = 100
const MAX_CACHE_SIZE_MB = 500

// Initialize IndexedDB
export const initCacheDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('songs')) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id' })
        songStore.createIndex('playCount', 'playCount')
        songStore.createIndex('lastPlayed', 'lastPlayed')
      }
      if (!db.objectStoreNames.contains('offlineAudio')) {
        const audioStore = db.createObjectStore('offlineAudio', { keyPath: 'songId' })
        audioStore.createIndex('cachedAt', 'cachedAt')
        audioStore.createIndex('size', 'size')
      }
      if (!db.objectStoreNames.contains('playStats')) {
        db.createObjectStore('playStats', { keyPath: 'songId' })
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

// Record song play (for smart caching)
export const recordSongPlay = async (songId) => {
  const db = await initCacheDB()
  const tx = db.transaction(['playStats'], 'readwrite')
  let stats = await tx.objectStore('playStats').get(songId)
  if (!stats) {
    stats = { songId, playCount: 0, lastPlayed: Date.now() }
  }
  stats.playCount += 1
  stats.lastPlayed = Date.now()
  await tx.objectStore('playStats').put(stats)
  await tx.done
}

// Get most played songs
export const getMostPlayedSongs = async (limit = 20) => {
  const db = await initCacheDB()
  const stats = await db.getAllFromIndex('playStats', 'playCount')
  return stats
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
    .map(stat => stat.songId)
}

// Cache audio file for offline
export const cacheAudioFile = async (songId, audioUrl, sizeMB) => {
  const db = await initCacheDB()
  const cachedFiles = await db.getAllFromIndex('offlineAudio', 'cachedAt')
  let totalSize = cachedFiles.reduce((sum, file) => sum + (file.size || 0), 0)
  
  // Evict if needed
  while (cachedFiles.length >= MAX_CACHED_SONGS || totalSize + sizeMB > MAX_CACHE_SIZE_MB) {
    const mostPlayed = await getMostPlayedSongs(MAX_CACHED_SONGS)
    const toEvict = cachedFiles.find(file => !mostPlayed.includes(file.songId))
    if (toEvict) {
      await evictCachedSong(toEvict.songId)
      totalSize -= toEvict.size || 0
      cachedFiles.splice(cachedFiles.indexOf(toEvict), 1)
    } else break
  }
  
  // Fetch and store in Cache API
  const cache = await caches.open('audio-cache')
  const response = await fetch(audioUrl)
  await cache.put(songId, response)
  
  await db.put('offlineAudio', {
    songId,
    cachedAt: Date.now(),
    size: sizeMB,
    url: audioUrl
  })
}

// Get cached audio blob URL
export const getCachedAudio = async (songId) => {
  const cache = await caches.open('audio-cache')
  const cachedResponse = await cache.match(songId)
  if (cachedResponse) {
    return URL.createObjectURL(await cachedResponse.blob())
  }
  return null
}

export const isSongCached = async (songId) => {
  const db = await initCacheDB()
  const cached = await db.get('offlineAudio', songId)
  return !!cached
}

export const evictCachedSong = async (songId) => {
  const db = await initCacheDB()
  const cache = await caches.open('audio-cache')
  await cache.delete(songId)
  await db.delete('offlineAudio', songId)
}

// Auto-cache most played songs
export const autoCacheMostPlayed = async (songsMap, qualityUrlGetter) => {
  const mostPlayedIds = await getMostPlayedSongs(20)
  for (const songId of mostPlayedIds) {
    const isCached = await isSongCached(songId)
    if (!isCached && songsMap[songId]) {
      const song = songsMap[songId]
      const audioUrl = qualityUrlGetter(song, '64') // medium quality for offline
      await cacheAudioFile(songId, audioUrl, 3)
    }
  }
}

// Sync queue for offline actions
export const addToSyncQueue = async (action) => {
  const db = await initCacheDB()
  await db.add('syncQueue', { ...action, createdAt: Date.now() })
}

export const processSyncQueue = async () => {
  const db = await initCacheDB()
  const queue = await db.getAll('syncQueue')
  for (const item of queue) {
    try {
      // Replay action (e.g., add to playlist, like song)
      // Implementation depends on your action types
      await db.delete('syncQueue', item.id)
    } catch (e) {
      console.error('Sync failed', e)
    }
  }
}