import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPlaylistSongs, supabase } from '../services/supabase'
import SongCard from '../components/SongCard/SongCard'
import { setCurrentPlaylist, setCurrentPlaylistSongs } from '../store/slices/playlistSlice'
import { MoreHorizontal, Play } from 'lucide-react'

const PlaylistDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const [playlist, setPlaylist] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlaylist()
  }, [id])

  const loadPlaylist = async () => {
    setLoading(true)
    try {
      // Fetch playlist info
      const { data: playlistData } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single()
      setPlaylist(playlistData)

      // Fetch songs
      const playlistSongs = await fetchPlaylistSongs(id)
      setSongs(playlistSongs)
      dispatch(setCurrentPlaylistSongs(playlistSongs))
      dispatch(setCurrentPlaylist(playlistSongs))
    } catch (error) {
      console.error('Failed to load playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      dispatch(setCurrentPlaylist(songs))
      // You can also set the first song to play
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-spotify-light-gray">Loading playlist...</div>
  }

  if (!playlist) {
    return <div className="p-8 text-center text-spotify-light-gray">Playlist not found</div>
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-b from-spotify-green/30 to-spotify-black">
        <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6">
          <div className="w-48 h-48 bg-spotify-dark shadow-2xl flex items-center justify-center rounded-md">
            <svg className="w-24 h-24 text-spotify-light-gray" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide">Playlist</p>
            <h1 className="text-5xl font-bold text-white mt-2">{playlist.name}</h1>
            <p className="text-spotify-light-gray mt-2">{songs.length} songs</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 py-4 flex items-center gap-4">
        <button 
          onClick={handlePlayAll}
          className="bg-spotify-green text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition"
        >
          <Play size={18} className="inline mr-2" /> Play
        </button>
        <button className="text-spotify-light-gray hover:text-white">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Songs list */}
      <div className="px-8">
        {songs.length === 0 ? (
          <p className="text-spotify-light-gray text-center py-12">No songs in this playlist yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} playlist={songs} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaylistDetails