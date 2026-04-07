import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import SeekBar from './SeekBar'
import VolumeControl from './VolumeControl'
import QualitySelector from './QualitySelector'
import { toggleRepeat, toggleShuffle } from '../../store/slices/playerSlice'

const Player = () => {
  const dispatch = useDispatch()
  const { currentSong, repeatMode, isShuffled } = useSelector((state) => state.player)
  const { playPause, playNext, playPrevious, isPlaying, currentTime, duration, changeVolume } = useAudioPlayer()

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-spotify-dark border-t border-spotify-gray p-4">
        <div className="text-center text-spotify-light-gray">Select a song to start playing</div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-dark border-t border-spotify-gray p-4 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-1/4">
          <img 
            src={currentSong.cover_url || '/default-cover.jpg'} 
            alt={currentSong.title}
            className="w-14 h-14 rounded-md object-cover"
          />
          <div>
            <h4 className="text-white font-medium">{currentSong.title}</h4>
            <p className="text-spotify-light-gray text-sm">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-1/2">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => dispatch(toggleShuffle())}
              className={`player-button ${isShuffled ? 'text-spotify-green' : ''}`}
            >
              <Shuffle size={20} />
            </button>
            <button onClick={playPrevious} className="player-button">
              <SkipBack size={20} />
            </button>
            <button 
              onClick={playPause}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="player-button">
              <SkipForward size={20} />
            </button>
            <button 
              onClick={() => dispatch(toggleRepeat())}
              className={`player-button ${repeatMode !== 'off' ? 'text-spotify-green' : ''}`}
            >
              <Repeat size={20} />
            </button>
          </div>
          <SeekBar currentTime={currentTime} duration={duration} onSeek={(time) => playPause?.seek?.(time) || console.warn('seek not implemented')} />
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <QualitySelector />
          <VolumeControl onVolumeChange={changeVolume} />
        </div>
      </div>
    </div>
  )
}

export default Player