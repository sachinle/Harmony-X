import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ChevronDown, SkipBack, SkipForward, Play, Pause,
  Repeat, Repeat1, Shuffle, Heart, ListPlus, MoreHorizontal,
} from 'lucide-react'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import SeekBar from '../components/Player/SeekBar'
import {
  toggleRepeat, toggleShuffle, addToQueue,
} from '../store/slices/playerSlice'
import { addLikedSong, removeLikedSong } from '../store/slices/librarySlice'
import { likeSong, unlikeSong } from '../services/supabase'
import { formatDuration } from '../utils/formatters'
import PlayingAnimation from '../components/Player/PlayingAnimation'
import SongDetailsModal from '../components/Modals/SongDetailsModal'
import toast from 'react-hot-toast'

const NowPlaying = ({ onClose }) => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [showDetails, setShowDetails] = useState(false)

  const {
    currentSong, isPlaying, isBuffering,
    currentTime, duration, repeatMode, isShuffled,
  } = useSelector((s) => s.player)
  const { likedSongIds } = useSelector((s) => s.library)
  const { user } = useSelector((s) => s.user)

  const { playPause, seek, playNext, playPrev } = useAudioPlayer()
  const isLiked = currentSong ? likedSongIds.includes(currentSong.id) : false
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  const handleLike = async () => {
    if (!user || !currentSong) return
    try {
      if (isLiked) {
        await unlikeSong(user.uid, currentSong.id)
        dispatch(removeLikedSong(currentSong.id))
      } else {
        await likeSong(user.uid, currentSong.id)
        dispatch(addLikedSong(currentSong))
        toast.success('Added to Liked Songs')
      }
    } catch { toast.error('Could not update liked songs') }
  }

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <p className="text-lg font-medium mb-2">Nothing playing</p>
        <button onClick={onClose} className="text-spotify-green hover:underline text-sm">
          Browse music
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: `linear-gradient(180deg, rgba(30,30,30,0.95) 0%, #121212 60%)`,
      }}
    >
      {/* Dynamic color backdrop from cover */}
      <img
        src={currentSong.cover_url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-110 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#121212] pointer-events-none" />

      <div className="relative flex flex-col h-full px-6 pt-safe-top pb-safe-bottom">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition"
          >
            <ChevronDown size={28} />
          </button>
          <p className="text-white text-sm font-semibold">Now Playing</p>
          <button
            onClick={() => setShowDetails(true)}
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition"
          >
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Album art */}
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="relative w-full max-w-[300px] aspect-square">
            <img
              src={currentSong.cover_url || `https://picsum.photos/300/300?random=${currentSong.id}`}
              alt={currentSong.title}
              className={`w-full h-full rounded-2xl object-cover shadow-2xl transition-all duration-300 ${
                isPlaying ? 'scale-100' : 'scale-95 opacity-80'
              }`}
            />
            {isPlaying && (
              <div className="absolute top-3 right-3">
                <PlayingAnimation isPlaying size="md" />
              </div>
            )}
          </div>
        </div>

        {/* Song info + like */}
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-bold text-2xl truncate">{currentSong.title}</h2>
            <p className="text-white/60 text-base truncate">{currentSong.artist}</p>
            {currentSong.album && (
              <p className="text-white/40 text-sm truncate">{currentSong.album}</p>
            )}
          </div>
          <button
            onClick={handleLike}
            className={`ml-4 flex-shrink-0 transition-transform hover:scale-110 active:scale-95 ${
              isLiked ? 'text-spotify-green' : 'text-white/50 hover:text-white'
            }`}
          >
            <Heart size={26} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Seek bar */}
        <div className="mb-4">
          <SeekBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => dispatch(toggleShuffle())}
            className={`w-10 h-10 flex items-center justify-center transition ${
              isShuffled ? 'text-spotify-green' : 'text-white/50 hover:text-white'
            }`}
          >
            <Shuffle size={22} />
          </button>

          <button onClick={playPrev} className="text-white hover:text-white/80 transition active:scale-90">
            <SkipBack size={34} fill="currentColor" />
          </button>

          <button
            onClick={playPause}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} fill="black" />
            ) : (
              <Play size={28} fill="black" className="ml-1" />
            )}
          </button>

          <button onClick={playNext} className="text-white hover:text-white/80 transition active:scale-90">
            <SkipForward size={34} fill="currentColor" />
          </button>

          <button
            onClick={() => dispatch(toggleRepeat())}
            className={`w-10 h-10 flex items-center justify-center relative transition ${
              repeatMode !== 'off' ? 'text-spotify-green' : 'text-white/50 hover:text-white'
            }`}
          >
            <RepeatIcon size={22} />
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
            )}
          </button>
        </div>

        {/* Add to queue */}
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={() => { dispatch(addToQueue(currentSong)); toast.success('Added to queue') }}
            className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm"
          >
            <ListPlus size={18} /> Add to queue
          </button>
        </div>
      </div>

      {showDetails && currentSong && (
        <SongDetailsModal song={currentSong} onClose={() => setShowDetails(false)} />
      )}
    </div>
  )
}

export default NowPlaying
