import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react'

const PlayerControls = ({ 
  isPlaying, onPlayPause, onPrevious, onNext, 
  repeatMode, onToggleRepeat, isShuffled, onToggleShuffle 
}) => {
  return (
    <div className="flex items-center gap-4">
      <button onClick={onToggleShuffle} className={`player-button ${isShuffled ? 'text-spotify-green' : ''}`}>
        <Shuffle size={20} />
      </button>
      <button onClick={onPrevious} className="player-button">
        <SkipBack size={20} />
      </button>
      <button 
        onClick={onPlayPause}
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
      </button>
      <button onClick={onNext} className="player-button">
        <SkipForward size={20} />
      </button>
      <button onClick={onToggleRepeat} className={`player-button ${repeatMode !== 'off' ? 'text-spotify-green' : ''}`}>
        <Repeat size={20} />
      </button>
    </div>
  )
}

export default PlayerControls