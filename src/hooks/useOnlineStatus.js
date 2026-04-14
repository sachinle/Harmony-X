import { useState, useEffect } from 'react'

/**
 * Tracks real-time network status.
 * Returns { isOnline, wasOffline }
 *  - isOnline:   current connectivity
 *  - wasOffline: true once we've seen at least one offline event this session
 *                (used to show "back online" sync messages)
 */
export const useOnlineStatus = () => {
  const [isOnline,   setIsOnline]   = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const goOnline  = () => { setIsOnline(true) }
    const goOffline = () => { setIsOnline(false); setWasOffline(true) }

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
