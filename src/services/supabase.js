import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Users ────────────────────────────────────────────────────────────────────
export const upsertUser = async (uid, name, email, photoURL = null) => {
  const { error } = await supabase
    .from('users')
    .upsert({ id: uid, name, email }, { onConflict: 'id' })
  if (error) console.error('upsertUser error:', error)
}

export const updateUserName = async (uid, name) => {
  const { error } = await supabase.from('users').update({ name }).eq('id', uid)
  if (error) throw error
}

// ─── Songs ────────────────────────────────────────────────────────────────────
export const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const fetchSongById = async (id) => {
  const { data, error } = await supabase.from('songs').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const fetchSongsByGenre = async (genre) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('genre', genre)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const incrementPlayCount = async (songId) => {
  // Use rpc or manual increment — suppress errors silently
  try {
    await supabase.rpc('increment_play_count', { song_id: songId })
  } catch (_) { /* ignore */ }
}

// ─── Playlists ────────────────────────────────────────────────────────────────
export const fetchUserPlaylists = async (userId) => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createPlaylist = async (userId, name) => {
  const { data, error } = await supabase
    .from('playlists')
    .insert([{ user_id: userId, name }])
    .select()
    .single()
  if (error) throw error
  return data
}

export const deletePlaylist = async (playlistId) => {
  const { error } = await supabase.from('playlists').delete().eq('id', playlistId)
  if (error) throw error
}

export const fetchPlaylistSongs = async (playlistId) => {
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('songs(*), position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })
  if (error) throw error
  return data.map(item => item.songs).filter(Boolean)
}

export const addSongToPlaylist = async (playlistId, songId, position = 0) => {
  const { error } = await supabase
    .from('playlist_songs')
    .insert([{ playlist_id: playlistId, song_id: songId, position }])
  if (error && !error.message.includes('duplicate')) throw error
}

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId)
  if (error) throw error
}

// ─── Liked Songs ──────────────────────────────────────────────────────────────
export const fetchLikedSongs = async (userId) => {
  const { data, error } = await supabase
    .from('liked_songs')
    .select('songs(*)')
    .eq('user_id', userId)
    .order('liked_at', { ascending: false })
  if (error) throw error
  return data.map(item => item.songs).filter(Boolean)
}

export const likeSong = async (userId, songId) => {
  const { error } = await supabase
    .from('liked_songs')
    .insert([{ user_id: userId, song_id: songId }])
  if (error && !error.message.includes('duplicate')) throw error
}

export const unlikeSong = async (userId, songId) => {
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId)
  if (error) throw error
}

export const fetchLikedSongIds = async (userId) => {
  const { data, error } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', userId)
  if (error) return []
  return data.map(item => item.song_id)
}

// ─── Listening History ────────────────────────────────────────────────────────
export const addToListeningHistory = async (userId, songId) => {
  const { error } = await supabase
    .from('listening_history')
    .insert([{ user_id: userId, song_id: songId, played_at: new Date().toISOString() }])
  if (error) console.error('listening history error:', error)
}

export const fetchListeningHistory = async (userId, limit = 20) => {
  const { data, error } = await supabase
    .from('listening_history')
    .select('songs(*)')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  const seen = new Set()
  return data
    .map(item => item.songs)
    .filter(song => {
      if (!song || seen.has(song.id)) return false
      seen.add(song.id)
      return true
    })
}

// ─── Device Sessions (multi-device sync) ─────────────────────────────────────
export const upsertDeviceSession = async (userId, deviceId, deviceName, sessionData) => {
  const { error } = await supabase
    .from('device_sessions')
    .upsert(
      { user_id: userId, device_id: deviceId, device_name: deviceName, ...sessionData, last_seen: new Date().toISOString() },
      { onConflict: 'user_id,device_id' }
    )
  if (error) console.error('upsertDeviceSession error:', error)
}

export const fetchDeviceSessions = async (userId) => {
  const { data, error } = await supabase
    .from('device_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // last 5 min
    .order('last_seen', { ascending: false })
  if (error) return []
  return data
}

export const removeDeviceSession = async (userId, deviceId) => {
  await supabase
    .from('device_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('device_id', deviceId)
}

// Subscribe to playback changes from other devices
// NOTE: .on() must be called BEFORE .subscribe()
export const subscribeToDeviceSync = (userId, onUpdate) => {
  const channel = supabase.channel(`device_sync:${userId}`)
  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'device_sessions', filter: `user_id=eq.${userId}` },
    (payload) => onUpdate(payload)
  )
  channel.subscribe()
  return channel
}