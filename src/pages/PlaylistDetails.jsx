import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPlaylistSongs, supabase, removeSongFromPlaylist } from '../services/supabase'
import { setCurrentPlaylistSongs } from '../store/slices/playlistSlice'
import { playSongFromPlaylist } from '../store/slices/playerSlice'
import { Play, Clock, Trash2, MoreHorizontal, Shuffle } from 'lucide-react'
import PlayingAnimation from '../components/Player/PlayingAnimation'
import SongContextMenu from '../components/SongCard/SongContextMenu'
import SongDetailsModal from '../components/Modals/SongDetailsModal'
import { formatDuration } from '../utils/formatters'
import { toggleShuffle } from '../store/slices/playerSlice'
import toast from 'react-hot-toast'

const GRADIENTS = [
  'from-purple-700', 'from-blue-700', 'from-green-700',
  'from-red-700', 'from-pink-700', 'from-indigo-700', 'from-teal-700',
]

const PlaylistDetails = () => {
  const { id }   = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.user)
  const { currentSong, isPlaying } = useSelector((s) => s.player)
  const [playlist, setPlaylist]     = useState(null)
  const [songs, setSongs]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [menuSong, setMenuSong]     = useState(null)
  const [detailSong, setDetailSong] = useState(null)
  const menuBtnRefs = useRef({})
  const gradient = GRADIENTS[id.charCodeAt(0) % GRADIENTS.length]

  useEffect(() => { loadPlaylist() }, [id])

  const loadPlaylist = async () => {
    setLoading(true)
    try {
      const { data: pl } = await supabase.from('playlists').select('*').eq('id', id).single()
      setPlaylist(pl)
      const plSongs = await fetchPlaylistSongs(id)
      setSongs(plSongs)
      dispatch(setCurrentPlaylistSongs(plSongs))
    } catch (e) { console.error('Playlist load error:', e) }
    finally { setLoading(false) }
  }

  const playSong = (song, index) =>
    dispatch(playSongFromPlaylist({ song, playlist: songs, index }))

  const handleRemoveSong = async (e, songId) => {
    e.stopPropagation()
    try {
      await removeSongFromPlaylist(id, songId)
      const updated = songs.filter(s => s.id !== songId)
      setSongs(updated)
      dispatch(setCurrentPlaylistSongs(updated))
      toast.success('Removed from playlist')
    } catch { toast.error('Failed to remove song') }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-spotify-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!playlist) return (
    <div className="px-8 pt-20 text-center">
      <p className="text-white text-xl mb-4">Playlist not found</p>
      <button onClick={() => navigate('/library')} className="text-spotify-green hover:underline">Go to Library</button>
    </div>
  )

  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0)
  const totalMin = Math.floor(totalDuration / 60)

  return (
    <div className="pb-36 md:pb-28">
      {/* Header */}
      <div className={`px-4 md:px-8 pt-12 md:pt-16 pb-8 bg-gradient-to-b ${gradient} to-[#121212]`}>
        <div className="flex items-end gap-4 md:gap-6">
          <div className="w-36 h-36 md:w-52 md:h-52 bg-white/10 rounded-md flex items-center justify-center shadow-2xl flex-shrink-0">
            <svg className="w-16 h-16 md:w-24 md:h-24 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs md:text-sm uppercase font-bold tracking-widest mb-2">Playlist</p>
            <h1 className="text-white font-black mb-2 md:mb-3" style={{ fontSize: 'clamp(1.5rem,4vw,3.5rem)', lineHeight: 1.1 }}>
              {playlist.name}
            </h1>
            <p className="text-white/70 text-xs md:text-sm">
              {user?.name} • {songs.length} song{songs.length !== 1 ? 's' : ''}
              {totalMin > 0 ? ` • ${totalMin} min` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 md:px-8 py-4 md:py-6 flex items-center gap-4">
        <button
          onClick={() => songs.length && playSong(songs[0], 0)}
          disabled={!songs.length}
          className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center hover:scale-105 transition shadow-lg disabled:opacity-40"
        >
          <Play size={24} fill="black" className="ml-1" />
        </button>
        {songs.length > 1 && (
          <button
            onClick={() => dispatch(toggleShuffle())}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white"
            title="Shuffle play"
          >
            <Shuffle size={20} />
          </button>
        )}
      </div>

      {/* Song list */}
      <div className="px-4 md:px-8">
        {songs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white font-bold text-xl mb-2">No songs yet</p>
            <p className="text-spotify-light-gray text-sm">Add songs using the context menu on any song.</p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden md:grid gap-4 px-4 py-2 text-spotify-light-gray text-xs uppercase tracking-wider border-b border-white/10 mb-2"
              style={{ gridTemplateColumns: '24px 4fr 3fr 80px 80px' }}>
              <span>#</span><span>Title</span><span>Album</span>
              <span className="flex justify-end"><Clock size={14} /></span>
              <span />
            </div>

            {songs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, i)}
                  className={`flex md:grid gap-3 md:gap-4 px-2 md:px-4 py-2 rounded-md cursor-pointer group transition hover:bg-white/10 items-center ${isCurrent ? 'bg-white/5' : ''}`}
                  style={{ gridTemplateColumns: '24px 4fr 3fr 80px 80px' }}
                >
                  {/* Row number / animation */}
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

                  {/* Actions */}
                  <div className="hidden md:flex items-center justify-end gap-1">
                    <button
                      ref={(el) => { menuBtnRefs.current[song.id] = el }}
                      onClick={(e) => { e.stopPropagation(); setMenuSong(menuSong?.id === song.id ? null : song) }}
                      className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-white transition"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <button
                      onClick={(e) => handleRemoveSong(e, song.id)}
                      className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
          onPlay={() => playSong(menuSong, songs.findIndex(s => s.id === menuSong.id))}
        />
      )}

      {detailSong && (
        <SongDetailsModal song={detailSong} onClose={() => setDetailSong(null)} />
      )}
    </div>
  )
}

export default PlaylistDetails
