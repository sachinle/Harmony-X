import React, { useRef, useState, useCallback } from 'react'

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00'
  const m = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SeekBar = ({ currentTime, duration, onSeek }) => {
  const barRef   = useRef(null)
  const dragging = useRef(false)
  const [localPct, setLocalPct] = useState(null) // live override while dragging

  const pctFromClientX = useCallback((clientX) => {
    const rect = barRef.current?.getBoundingClientRect()
    if (!rect) return null
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }, [])

  // ── Mouse ─────────────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    dragging.current = true
    const pct = pctFromClientX(e.clientX)
    if (pct !== null) setLocalPct(pct)

    const onMove = (mv) => {
      if (!dragging.current) return
      const p = pctFromClientX(mv.clientX)
      if (p !== null) setLocalPct(p)
    }
    const onUp = (mv) => {
      dragging.current = false
      const p = pctFromClientX(mv.clientX)
      if (p !== null && duration) onSeek(p * duration)
      setLocalPct(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Touch ─────────────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    dragging.current = true
    const pct = pctFromClientX(e.touches[0].clientX)
    if (pct !== null) setLocalPct(pct)
  }
  const onTouchMove = (e) => {
    if (!dragging.current) return
    e.preventDefault() // prevent scroll-jank while scrubbing
    const pct = pctFromClientX(e.touches[0].clientX)
    if (pct !== null) setLocalPct(pct)
  }
  const onTouchEnd = (e) => {
    dragging.current = false
    const pct = pctFromClientX(e.changedTouches[0].clientX)
    if (pct !== null && duration) onSeek(pct * duration)
    setLocalPct(null)
  }

  const displayPct  = localPct !== null ? localPct * 100 : duration ? (currentTime / duration) * 100 : 0
  const displayTime = localPct !== null ? (localPct * duration) : currentTime

  return (
    <div className="flex items-center gap-3 w-full select-none">
      <span className="text-xs text-spotify-light-gray w-10 text-right tabular-nums shrink-0">
        {formatTime(displayTime)}
      </span>

      {/* Bar — tall touch target, thin visual bar inside */}
      <div
        ref={barRef}
        className="flex-1 relative h-5 flex items-center cursor-pointer group touch-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute w-full h-1 group-hover:h-[5px] transition-all duration-150 rounded-full bg-white/20">
          <div
            className="h-full bg-spotify-green rounded-full relative transition-none"
            style={{ width: `${displayPct}%` }}
          >
            {/* Thumb — always visible on mobile, hover-only on desktop */}
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
                         w-3.5 h-3.5 rounded-full bg-white shadow
                         opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150"
            />
          </div>
        </div>
      </div>

      <span className="text-xs text-spotify-light-gray w-10 tabular-nums shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  )
}

export default SeekBar
