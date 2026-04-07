import React, { useRef, useEffect } from 'react'

const SeekBar = ({ currentTime, duration, onSeek }) => {
  const progressRef = useRef(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(1, Math.max(0, x / rect.width))
    const newTime = percent * duration
    onSeek(newTime)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleSeek(e)
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', () => setIsDragging(false))
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', () => setIsDragging(false))
    }
  }, [isDragging])

  const percent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 w-full max-w-2xl">
      <span className="text-xs text-spotify-light-gray">{formatTime(currentTime)}</span>
      <div 
        ref={progressRef}
        className="flex-1 h-1 bg-spotify-gray rounded-full cursor-pointer relative group"
        onClick={handleSeek}
        onMouseDown={() => setIsDragging(true)}
      >
        <div 
          className="absolute h-full bg-spotify-green rounded-full"
          style={{ width: `${percent}%` }}
        />
        <div 
          className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition"
          style={{ left: `calc(${percent}% - 6px)`, top: '-4px' }}
        />
      </div>
      <span className="text-xs text-spotify-light-gray">{formatTime(duration)}</span>
    </div>
  )
}

export default SeekBar