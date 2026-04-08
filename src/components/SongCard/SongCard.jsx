import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react'
import { playSongFromPlaylist } from '../../store/slices/playerSlice'
import { addLikedSong, removeLikedSong } from '../../store/slices/librarySlice'
import { likeSong, unlikeSong } from '../../services/supabase'
import PlayingAnimation from '../Player/PlayingAnimation'
import SongContextMenu from './SongContextMenu'
import SongDetailsModal from '../Modals/SongDetailsModal'
import toast from 'react-hot-toast'

const SongCard = ({ song, playlist = null, index = 0 }) => {
  const dispatch = useDispatch()
  const menuBtnRef = useRef(null)
  const [showMenu, setShowMenu]       = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const { currentSong, isPlaying } = useSelector((s) => s.player)
  const { user }       = useSelector((s) => s.user)
  const { likedSongIds } = useSelector((s) => s.library)

  const isCurrentSong = currentSong?.id === song.id
  const isLiked       = likedSongIds.includes(song.id)

  const handlePlay = () => {
    const pl  = playlist || [song]
    const idx = playlist ? index : 0
    dispatch(playSongFromPlaylist({ song, playlist: pl, index: idx }))
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) { toast.error('Please log in to like songs'); return }
    setLikeLoading(true)
    try {
      if (isLiked) {
        await unlikeSong(user.uid, song.id)
        dispatch(removeLikedSong(song.id))
      } else {
        await likeSong(user.uid, song.id)
        dispatch(addLikedSong(song))
        toast.success(`Added "${song.title}" to Liked Songs`)
      }
    } catch { toast.error('Could not update liked songs') }
    finally { setLikeLoading(false) }
  }

  return (
    <>
      <div
        className="group bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-200 cursor-pointer relative"
        onClick={handlePlay}
      >
        {/* Cover */}
        <div className="relative mb-4">
          <img
            src={song.cover_url || `https://picsum.photos/200/200?random=${song.id}`}
            alt={song.title}
            className="w-full aspect-square rounded-md object-cover shadow-lg"
          />

          {/* Play/pause overlay button */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePlay() }}
            className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-spotify-green shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-spotify-green-hover ${
              isCurrentSong && isPlaying
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
            }`}
          >
            {isCurrentSong && isPlaying
              ? <Pause size={20} fill="black" />
              : <Play  size={20} fill="black" className="ml-0.5" />
            }
          </button>

          {/* Playing animation overlay (top-left) */}
          {isCurrentSong && (
            <div className="absolute top-2 left-2 bg-black/50 rounded px-1.5 py-1">
              <PlayingAnimation isPlaying={isPlaying} size="sm" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-sm font-semibold truncate mb-1 ${isCurrentSong ? 'text-spotify-green' : 'text-white'}`}>
          {song.title}
        </h3>
        <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
        {song.genre && (
          <p className="text-white/30 text-xs truncate mt-0.5">{song.genre}</p>
        )}

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`absolute top-3 right-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isLiked ? 'text-spotify-green opacity-100' : 'text-white/70 hover:text-white'
          }`}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* 3-dot context menu button */}
        <button
          ref={menuBtnRef}
          onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v) }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white/70 hover:text-white"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Context menu */}
      {showMenu && (
        <SongContextMenu
          song={song}
          triggerRef={menuBtnRef}
          onClose={() => setShowMenu(false)}
          onShowDetails={() => setShowDetails(true)}
          onPlay={handlePlay}
        />
      )}

      {/* Details modal */}
      {showDetails && (
        <SongDetailsModal song={song} onClose={() => setShowDetails(false)} />
      )}
    </>
  )
}

export default SongCard
