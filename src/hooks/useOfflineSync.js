import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { syncQueue } from '../services/cacheService' // hypothetical queue

export const useOfflineSync = () => {
  const dispatch = useDispatch()
  const isOnline = useRef(navigator.onLine)

  useEffect(() => {
    const handleOnline = async () => {
      isOnline.current = true
      // Sync pending actions (e.g., play history, playlist changes)
      if (window.syncPendingActions) {
        await window.syncPendingActions()
      }
    }
    const handleOffline = () => {
      isOnline.current = false
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [dispatch])

  const isOffline = !isOnline.current
  return { isOffline }
}