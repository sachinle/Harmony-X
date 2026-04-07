import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SongCard from '../components/SongCard/SongCard'
import PlaylistCard from '../components/Playlist/PlaylistCard'
import { fetchUserPlaylists, fetchListeningHistory, supabase } from '../services/supabase'

const Library = ({ filter }) => {
  const { user } = useSelector((state) => state.user)
  const [playlists, setPlaylists] = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadLibrary()
    }
  }, [user, filter])

  const loadLibrary = async () => {
    setLoading(true)
    try {
      const userPlaylists = await fetchUserPlaylists(user.uid)
      setPlaylists(userPlaylists)

      if (filter === 'liked') {
        // Fetch liked songs (using a 'likes' table; here we simulate with listening history)
        const history = await fetchListeningHistory(user.uid, 50)
        setLikedSongs(history)
      }
    } catch (error) {
      console.error('Failed to load library:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-spotify-light-gray">Loading your library...</div>
  }

  if (filter === 'liked') {
    return (
      <div className="p-8 pb-32">
        <h1 className="text-3xl font-bold text-white mb-6">Liked Songs</h1>
        {likedSongs.length === 0 ? (
          <p className="text-spotify-light-gray">No liked songs yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {likedSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold text-white mb-6">Your Playlists</h1>
      {playlists.length === 0 ? (
        <p className="text-spotify-light-gray">No playlists yet. Create one from the sidebar.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Library