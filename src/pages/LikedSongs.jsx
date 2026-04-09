import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Play, Clock, Heart, MoreHorizontal } from 'lucide-react'
import { fetchLikedSongs } from '../services/supabase'
import { setLikedSongs } from '../store/slices/librarySlice'
import { playSongFromPlaylist } from '../store/slices/playerSlice'
import PlayingAnimation from '../components/Player/PlayingAnimation'
import SongContextMenu from '../components/SongCard/SongContextMenu'
import SongDetailsModal from '../components/Modals/SongDetailsModal'
import { formatDuration } from '../utils/formatters'

const LikedSongs = () => {
  const dispatch = useDispatch()
  const { user }       = useSelector((s) => s.user)
  const { likedSongs } = useSelector((s) => s.library)
  const { currentSong, isPlaying } = useSelector((s) => s.player)
  const [loading, setLoading]       = useState(false)
  const [menuSong, setMenuSong]     = useState(null)
  const [detailSong, setDetailSong] = useState(null)
  const menuBtnRefs = useRef({})

  useEffect(() => {
    if (user && likedSongs.length === 0) loadLiked()
  }, [user])

  const loadLiked = async () => {
    setLoading(true)
    try {
      const songs = await fetchLikedSongs(user.uid)
      dispatch(setLikedSongs(songs))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const playSong = (song, index) =>
    dispatch(playSongFromPlaylist({ song, playlist: likedSongs, index }))

  const totalDuration = likedSongs.reduce((a, s) => a + (s.duration || 0), 0)
  const totalMin = Math.floor(totalDuration / 60)

  return (
    <div className="pb-36 md:pb-28">
      {/* Header */}
      <div className="px-4 md:px-8 pt-12 md:pt-16 pb-8 bg-gradient-to-b from-indigo-800 via-indigo-900 to-spotify-black">
        <div className="flex items-end gap-4 md:gap-6">
          <div className="w-36 h-36 md:w-52 md:h-52 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-md flex items-center justify-center shadow-2xl flex-shrink-0">
            <Heart size={60} fill="white" className="text-white md:w-20 md:h-20" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs md:text-sm uppercase font-bold tracking-widest mb-2">Playlist</p>
            <h1 className="text-white font-black mb-2 md:mb-3" style={{ fontSize: 'clamp(1.8rem,5vw,4rem)', lineHeight: 1 }}>
              Liked Songs
            </h1>
            <p className="text-white/80 text-xs md:text-sm">
              {user?.name} • {likedSongs.length} songs
              {totalMin > 0 && ` • about ${totalMin} min`}
            </p>
          </div>
        </div>
      </div>

      {/* Play button */}
      <div className="px-4 md:px-8 py-4 md:py-6">
        <button
          onClick={() => likedSongs.length && playSong(likedSongs[0], 0)}
          disabled={!likedSongs.length}
          className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center hover:scale-105 transition shadow-lg disabled:opacity-40"
        >
          <Play size={24} fill="black" className="ml-1" />
        </button>
      </div>

      {/* Song table */}
      <div className="px-4 md:px-8">
        {loading ? (
          <div className="text-spotify-light-gray text-sm py-8 text-center">Loading…</div>
        ) : likedSongs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white font-bold text-xl mb-2">Songs you like will appear here</p>
            <p className="text-spotify-light-gray text-sm">Save songs by tapping the heart icon.</p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden md:grid gap-4 px-4 py-2 text-spotify-light-gray text-xs uppercase tracking-wider border-b border-white/10 mb-2"
              style={{ gridTemplateColumns: '24px 4fr 3fr 80px 40px' }}>
              <span>#</span><span>Title</span><span>Album</span>
              <span className="flex justify-end"><Clock size={14} /></span>
              <span />
            </div>

            {likedSongs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, i)}
                  className={`flex md:grid gap-3 md:gap-4 px-2 md:px-4 py-2 rounded-md cursor-pointer group transition hover:bg-white/10 items-center ${isCurrent ? 'bg-white/5' : ''}`}
                  style={{ gridTemplateColumns: '24px 4fr 3fr 80px 40px' }}
                >
                  {/* Row number / playing animation */}
                  <span className="hidden md:flex items-center justify-center text-spotify-light-gray text-sm w-6">
                    {isCurrent
                      ? <PlayingAnimation isPlaying={isPlaying} size="sm" />
                      : <span className="group-hover:hidden">{i + 1}</span>
                    }
                    {!isCurrent && (
                      <Play size={14} className="hidden group-hover:block text-white" />
                    )}
                  </span>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <img src={song.cover_url || 'https://picsum.photos/40/40'} alt={song.title}
                        className="w-10 h-10 rounded object-cover" />
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
                          <PlayingAnimation isPlaying size="sm" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>{song.title}</p>
                      <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
                    </div>
                  </div>

                  <span className="hidden md:block text-spotify-light-gray text-sm truncate">{song.album || '—'}</span>
                  <span className="hidden md:flex text-spotify-light-gray text-sm justify-end">{formatDuration(song.duration)}</span>

                  {/* Mobile duration */}
                  <span className="md:hidden text-spotify-light-gray text-xs ml-auto">{formatDuration(song.duration)}</span>

                  {/* Context menu — always visible on mobile, hover-only on desktop */}
                  <button
                    ref={(el) => { menuBtnRefs.current[song.id] = el }}
                    onClick={(e) => { e.stopPropagation(); setMenuSong(menuSong?.id === song.id ? null : song) }}
                    className="md:opacity-0 md:group-hover:opacity-100 opacity-100 text-spotify-light-gray hover:text-white transition flex items-center justify-center"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Context menu */}
      {menuSong && (
        <SongContextMenu
          song={menuSong}
          triggerRef={{ current: menuBtnRefs.current[menuSong.id] }}
          onClose={() => setMenuSong(null)}
          onShowDetails={() => { setDetailSong(menuSong); setMenuSong(null) }}
          onPlay={() => playSong(menuSong, likedSongs.findIndex(s => s.id === menuSong.id))}
        />
      )}

      {/* Details modal */}
      {detailSong && (
        <SongDetailsModal song={detailSong} onClose={() => setDetailSong(null)} />
      )}
    </div>
  )
}

export default LikedSongs
