import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Play, Pause, SkipBack, SkipForward,
  Repeat, Repeat1, Shuffle, Heart,
  ListMusic, Monitor, Moon, X, Check,
} from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { useDeviceSync } from '../../hooks/useDeviceSync'
import SeekBar from './SeekBar'
import VolumeControl from './VolumeControl'
import QualitySelector from './QualitySelector'
import PlayingAnimation from './PlayingAnimation'
import QueuePanel from '../Queue/QueuePanel'
import DevicePanel from '../Devices/DevicePanel'
import {
  toggleRepeat, toggleShuffle,
  toggleQueuePanel, toggleDevicePanel,
  setSleepTimer, clearSleepTimer,
} from '../../store/slices/playerSlice'
import { setLikedSongs } from '../../store/slices/librarySlice'
import { likeSong, unlikeSong } from '../../services/supabase'
import toast from 'react-hot-toast'

const SLEEP_OPTIONS = [
  { label: '15 min',  ms: 15 * 60 * 1000  },
  { label: '30 min',  ms: 30 * 60 * 1000  },
  { label: '45 min',  ms: 45 * 60 * 1000  },
  { label: '1 hour',  ms: 60 * 60 * 1000  },
  { label: 'End of song', ms: -1 },
]

const Player = () => {
  const dispatch  = useDispatch()
  const [showSleepMenu, setShowSleepMenu] = useState(false)
  const [sleepCountdown, setSleepCountdown] = useState(null)
  const sleepRef = useRef(null)

  const {
    currentSong, repeatMode, isShuffled,
    isPlaying, currentTime, duration, isBuffering,
    showQueue, showDevices, sleepTimerEnd, queue,
  } = useSelector((s) => s.player)
  const { user } = useSelector((s) => s.user)
  const { likedSongs } = useSelector((s) => s.library)

  const { playPause, seek, changeVolume, playNext, playPrev } = useAudioPlayer()
  // Initialise device sync
  useDeviceSync()

  const isLiked = currentSong ? (likedSongs?.some(s => s.id === currentSong.id) ?? false) : false
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  const handleLike = async () => {
    if (!user || !currentSong) return
    try {
      if (isLiked) {
        await unlikeSong(user.uid, currentSong.id)
        dispatch(setLikedSongs(likedSongs.filter(s => s.id !== currentSong.id)))
        toast.success('Removed from Liked Songs')
      } else {
        await likeSong(user.uid, currentSong.id)
        dispatch(setLikedSongs([...likedSongs, currentSong]))
        toast.success('Added to Liked Songs')
      }
    } catch { toast.error('Could not update liked songs') }
  }

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepTimerEnd) { setSleepCountdown(null); return }
    const tick = () => {
      const remaining = sleepTimerEnd - Date.now()
      if (remaining <= 0) {
        dispatch(clearSleepTimer())
        toast('Sleep timer ended — playback stopped')
        return
      }
      const m = Math.floor(remaining / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setSleepCountdown(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    sleepRef.current = setInterval(tick, 1000)
    return () => clearInterval(sleepRef.current)
  }, [sleepTimerEnd])

  const handleSleepTimer = (ms) => {
    if (ms === -1) {
      // End of current song — handled in useAudioPlayer via sleepTimerEnd flag
      dispatch(setSleepTimer(Date.now() + (duration - currentTime) * 1000))
    } else {
      dispatch(setSleepTimer(Date.now() + ms))
    }
    toast.success('Sleep timer set')
    setShowSleepMenu(false)
  }

  return (
    <>
      {/* ── Main Player Bar ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-white/10 z-50 h-[90px] hidden md:block">
        <div className="h-full max-w-screen-2xl mx-auto grid grid-cols-3 items-center px-4">

          {/* Left: Song info */}
          <div className="flex items-center gap-3 min-w-0">
            {currentSong ? (
              <>
                <div className="relative flex-shrink-0">
                  <img
                    src={currentSong.cover_url || 'https://picsum.photos/56/56?random=0'}
                    alt={currentSong.title}
                    className="w-14 h-14 rounded object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                      <PlayingAnimation isPlaying={isPlaying} size="sm" />
                    </div>
                  )}
                </div>
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

          {/* Right: Extra controls */}
          <div className="flex items-center justify-end gap-2">
            {/* Queue */}
            <button
              onClick={() => dispatch(toggleQueuePanel())}
              className={`player-button relative ${showQueue ? 'text-spotify-green' : ''}`}
              title="Queue"
            >
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-spotify-green rounded-full text-black text-[9px] font-bold flex items-center justify-center">
                  {queue.length > 9 ? '9+' : queue.length}
                </span>
              )}
            </button>

            {/* Device */}
            <button
              onClick={() => dispatch(toggleDevicePanel())}
              className={`player-button ${showDevices ? 'text-spotify-green' : ''}`}
              title="Devices"
            >
              <Monitor size={18} />
            </button>

            {/* Sleep timer */}
            <div className="relative">
              <button
                onClick={() => setShowSleepMenu((v) => !v)}
                className={`player-button relative ${sleepTimerEnd ? 'text-spotify-green' : ''}`}
                title="Sleep timer"
              >
                <Moon size={16} />
                {sleepCountdown && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-spotify-green whitespace-nowrap font-bold">
                    {sleepCountdown}
                  </span>
                )}
              </button>

              {showSleepMenu && (
                <div className="absolute bottom-12 right-0 bg-[#282828] rounded-lg shadow-2xl border border-white/10 py-1 w-40 z-[60] animate-fade-in">
                  <p className="px-4 py-2 text-spotify-light-gray text-xs font-bold uppercase tracking-wider">
                    Sleep after
                  </p>
                  {sleepTimerEnd && (
                    <button
                      onClick={() => { dispatch(clearSleepTimer()); setShowSleepMenu(false); toast.success('Sleep timer off') }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-white/10 text-sm transition"
                    >
                      <X size={14} /> Cancel timer
                    </button>
                  )}
                  {SLEEP_OPTIONS.map(({ label, ms }) => (
                    <button
                      key={label}
                      onClick={() => handleSleepTimer(ms)}
                      className="flex items-center justify-between w-full px-4 py-2 text-white hover:bg-white/10 text-sm transition"
                    >
                      {label}
                      {sleepTimerEnd && ms !== -1 && Math.abs((sleepTimerEnd - Date.now()) - ms) < 5000 && (
                        <Check size={14} className="text-spotify-green" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <QualitySelector />
            <VolumeControl onVolumeChange={changeVolume} />
          </div>
        </div>
      </div>

      {/* Panels */}
      <QueuePanel />
      <DevicePanel />
    </>
  )
}

export default Player