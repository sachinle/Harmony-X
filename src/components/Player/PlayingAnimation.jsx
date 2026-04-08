import React from 'react'

/**
 * Animated equalizer bars — shown whenever the identified song is currently playing.
 * Pass `isPlaying` to control whether bars animate or freeze.
 * Size variants: 'sm' (default, for tables), 'md' (for cards), 'lg' (for player).
 */
const PlayingAnimation = ({ isPlaying = true, size = 'sm', className = '' }) => {
  const heights = {
    sm: { container: 'h-4', bar: 'w-[3px]' },
    md: { container: 'h-5', bar: 'w-[3px]' },
    lg: { container: 'h-6', bar: 'w-[4px]' },
  }
  const { container, bar } = heights[size] || heights.sm

  return (
    <div
      className={`flex items-end gap-[2px] ${container} ${isPlaying ? '' : 'eq-paused'} ${className}`}
      aria-label={isPlaying ? 'Playing' : 'Paused'}
    >
      <span className={`eq-bar eq-bar-1 ${bar}`} style={{ height: '8px'  }} />
      <span className={`eq-bar eq-bar-2 ${bar}`} style={{ height: '14px' }} />
      <span className={`eq-bar eq-bar-3 ${bar}`} style={{ height: '6px'  }} />
      <span className={`eq-bar eq-bar-4 ${bar}`} style={{ height: '10px' }} />
    </div>
  )
}

export default PlayingAnimation
