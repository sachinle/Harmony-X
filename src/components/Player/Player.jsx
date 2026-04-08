import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Play, Pause, SkipBack, SkipForward,
  Repeat, Repeat1, Shuffle, Heart,
} from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import SeekBar from './SeekBar'
import VolumeControl from './VolumeControl'
import QualitySelector from './QualitySelector'
import { toggleRepeat, toggleShuffle } from '../../store/slices/playerSlice'
import { addLikedSong, removeLikedSong } from '../../store/slices/librarySlice'
import { likeSong, unlikeSong } from '../../services/supabase'
import toast from 'react-hot-toast'

const Player = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    currentSong, repeatMode, isShuffled,
    isPlaying, currentTime, duration, isBuffering,
  } = useSelector((state) => state.player)
  const { user } = useSelector((state) => state.user)
  const { likedSongIds } = useSelector((state) => state.library)

  const { playPause, seek, changeVolume, playNext, playPrev } = useAudioPlayer()

  const isLiked = currentSong ? likedSongIds.includes(currentSong.id) : false

  const handleLike = async () => {
    if (!user || !currentSong) return
    try {
      if (isLiked) {
        await unlikeSong(user.uid, currentSong.id)
        dispatch(removeLikedSong(currentSong.id))
        toast.success('Removed from Liked Songs')
      } else {
        await likeSong(user.uid, currentSong.id)
        dispatch(addLikedSong(currentSong))
        toast.success('Added to Liked Songs')
      }
    } catch {
      toast.error('Could not update liked songs')
    }
  }

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-white/10 z-50 h-[90px]">
      <div className="h-full max-w-screen-2xl mx-auto grid grid-cols-3 items-center px-4">

        {/* Left: Song info */}
        <div className="flex items-center gap-3 min-w-0">
          {currentSong ? (
            <>
              <img
                src={currentSong.cover_url || 'https://picsum.photos/56/56?random=0'}
                alt={currentSong.title}
                className="w-14 h-14 rounded object-cover flex-shrink-0 cursor-pointer hover:brightness-75 transition"
                onClick={() => navigate('/')}
              />
              <div className="min-w-0">
                <h4 className="text-white text-sm font-medium truncate">{currentSong.title}</h4>
                <p className="text-spotify-light-gray text-xs truncate">{currentSong.artist}</p>
              </div>
              <button
                onClick={handleLike}
                className={`ml-2 flex-shrink-0 transition-transform hover:scale-110 ${
                  isLiked ? 'text-spotify-green' : 'text-spotify-light-gray hover:text-white'
                }`}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </>
          ) : (
            <div className="w-14 h-14 rounded bg-spotify-gray flex-shrink-0" />
          )}
        </div>

        {/* Centre: Controls + Seek */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button
              onClick={() => dispatch(toggleShuffle())}
              className={`player-button ${isShuffled ? 'text-spotify-green' : ''}`}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>

            <button onClick={playPrev} className="player-button" title="Previous">
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              onClick={playPause}
              disabled={!currentSong}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
            >
              {isBuffering ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={18} fill="black" />
              ) : (
                <Play size={18} fill="black" className="ml-0.5" />
              )}
            </button>

            <button onClick={playNext} className="player-button" title="Next">
              <SkipForward size={20} fill="currentColor" />
            </button>

            <button
              onClick={() => dispatch(toggleRepeat())}
              className={`player-button relative ${repeatMode !== 'off' ? 'text-spotify-green' : ''}`}
              title={`Repeat: ${repeatMode}`}
            >
              <RepeatIcon size={18} />
              {repeatMode !== 'off' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
              )}
            </button>
          </div>

          <SeekBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        {/* Right: Volume + Quality */}
        <div className="flex items-center justify-end gap-3">
          <QualitySelector />
          <VolumeControl onVolumeChange={changeVolume} />
        </div>
      </div>
    </div>
  )
}

export default Player
