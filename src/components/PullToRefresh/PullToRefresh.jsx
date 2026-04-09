import React, { useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

const PullToRefresh = ({ onRefresh, children }) => {
  const [pulling, setPulling]     = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const threshold = 80

  const onTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const onTouchMove = (e) => {
    if (!startY.current) return
    const dist = e.touches[0].clientY - startY.current
    if (dist > 0 && window.scrollY === 0) {
      setPulling(true)
      setPullDistance(Math.min(dist, threshold + 20))
    }
  }

  const onTouchEnd = async () => {
    if (pullDistance >= threshold) {
      setRefreshing(true)
      await onRefresh()
      setRefreshing(false)
    }
    setPulling(false)
    setPullDistance(0)
    startY.current = 0
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pulling || refreshing ? `${pullDistance}px` : '0px' }}
      >
        <RefreshCw
          size={22}
          className={`text-spotify-green transition-transform duration-300 ${
            refreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: `rotate(${(pullDistance / threshold) * 360}deg)`
          }}
        />
      </div>
      {children}
    </div>
  )
}

export default PullToRefresh