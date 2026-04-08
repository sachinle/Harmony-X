import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Play, Clock, Heart } from 'lucide-react'
import { fetchLikedSongs } from '../services/supabase'
import { setLikedSongs } from '../store/slices/librarySlice'
import { playSongFromPlaylist } from '../store/slices/playerSlice'

const fmt = (s) => {
  if (!s) return '--:--'
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const LikedSongs = () => {
  const dispatch = useDispatch()
  const { user }  = useSelector((state) => state.user)
  const { likedSongs } = useSelector((state) => state.library)
  const { currentSong, isPlaying } = useSelector((state) => state.player)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && likedSongs.length === 0) loadLiked()
  }, [user])

  const loadLiked = async () => {
    setLoading(true)
    try {
      const songs = await fetchLikedSongs(user.uid)
      dispatch(setLikedSongs(songs))
    } catch (e) {
      console.error('Failed to load liked songs:', e)
    } finally {
      setLoading(false)
    }
  }

  const playSong = (song, index) =>
    dispatch(playSongFromPlaylist({ song, playlist: likedSongs, index }))

  return (
    <div className="pb-36">
      {/* Header */}
      <div className="px-8 pt-16 pb-8 bg-gradient-to-b from-indigo-800 via-indigo-900 to-spotify-black">
        <div className="flex items-end gap-6">
          <div className="w-52 h-52 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-md flex items-center justify-center shadow-2xl flex-shrink-0">
            <Heart size={80} fill="white" className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm uppercase font-bold tracking-widest mb-2">Playlist</p>
            <h1 className="text-white font-black mb-3" style={{ fontSize: 'clamp(2rem,5vw,4rem)', lineHeight: 1 }}>
              Liked Songs
            </h1>
            <p className="text-white/80 text-sm">{user?.name} • {likedSongs.length} songs</p>
          </div>
        </div>
      </div>

      {/* Play button */}
      <div className="px-8 py-6">
        <button
          onClick={() => likedSongs.length && playSong(likedSongs[0], 0)}
          disabled={!likedSongs.length}
          className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center hover:scale-105 transition shadow-lg disabled:opacity-40"
        >
          <Play size={24} fill="black" className="ml-1" />
        </button>
      </div>

      {/* Song table */}
      <div className="px-8">
        {loading ? (
          <div className="text-spotify-light-gray text-sm py-8">Loading liked songs…</div>
        ) : likedSongs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white font-bold text-xl mb-2">Songs you like will appear here</p>
            <p className="text-spotify-light-gray text-sm">Save songs by tapping the heart icon.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 px-4 py-2 text-spotify-light-gray text-xs uppercase tracking-wider border-b border-white/10 mb-2"
              style={{ gridTemplateColumns: '16px 4fr 3fr 1fr' }}>
              <span>#</span><span>Title</span><span>Album</span>
              <span className="flex justify-end"><Clock size={14} /></span>
            </div>

            {likedSongs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, i)}
                  className={`grid gap-4 px-4 py-2 rounded-md cursor-pointer group transition hover:bg-white/10 items-center ${isCurrent ? 'bg-white/5' : ''}`}
                  style={{ gridTemplateColumns: '16px 4fr 3fr 1fr' }}
                >
                  <span className="text-spotify-light-gray text-sm group-hover:hidden">
                    {isCurrent && isPlaying ? <span className="text-spotify-green">▶</span> : i + 1}
                  </span>
                  <Play size={14} className="hidden group-hover:block text-white" />

                  <div className="flex items-center gap-3 min-w-0">
                    <img src={song.cover_url || 'https://picsum.photos/40/40'} alt={song.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>{song.title}</p>
                      <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
                    </div>
                  </div>

                  <span className="text-spotify-light-gray text-sm truncate">{song.album || '—'}</span>
                  <span className="text-spotify-light-gray text-sm flex justify-end">{fmt(song.duration)}</span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default LikedSongs
