import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ----- Songs -----
export const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const fetchSongById = async (id) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ----- Playlists -----
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
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
  if (error) throw error
}

export const fetchPlaylistSongs = async (playlistId) => {
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('songs(*)')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })
  if (error) throw error
  return data.map(item => item.songs)
}

export const addSongToPlaylist = async (playlistId, songId, position = 0) => {
  const { error } = await supabase
    .from('playlist_songs')
    .insert([{ playlist_id: playlistId, song_id: songId, position }])
  if (error) throw error
}

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId)
  if (error) throw error
}

// ----- Listening History -----
export const addToListeningHistory = async (userId, songId) => {
  const { error } = await supabase
    .from('listening_history')
    .insert([{ user_id: userId, song_id: songId, played_at: new Date().toISOString() }])
  if (error) throw error
}

export const fetchListeningHistory = async (userId, limit = 20) => {
  const { data, error } = await supabase
    .from('listening_history')
    .select('songs(*)')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data.map(item => item.songs)
}