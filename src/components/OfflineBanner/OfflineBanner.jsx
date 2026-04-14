import React, { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { processSyncQueue } from '../../services/cacheService'
import { likeSong, unlikeSong, addSongToPlaylist } from '../../services/supabase'

/**
 * OfflineBanner
 * - Shows a persistent red bar while offline
 * - Shows a brief green "Back online" bar when connection is restored
 * - Triggers the sync queue replay when back online
 */
const OfflineBanner = () => {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true)
      // Replay any queued offline actions
      processSyncQueue({
        like:            (item) => likeSong(item.uid, item.songId),
        unlike:          (item) => unlikeSong(item.uid, item.songId),
        addToPlaylist:   (item) => addSongToPlaylist(item.playlistId, item.songId),
      }).catch(() => {})
      const t = setTimeout(() => setShowBackOnline(false), 3000)
      return () => clearTimeout(t)
    }
  }, [isOnline, wasOffline])

  // Nothing to show when online and no pending "back online" message
  if (isOnline && !showBackOnline) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold transition-all duration-300 ${
        !isOnline
          ? 'bg-red-600 text-white'
          : 'bg-spotify-green text-black'
      }`}
      style={{ paddingTop: 'calc(8px + var(--sat))' }}
    >
      {!isOnline ? (
        <>
          <WifiOff size={15} />
          <span>You're offline — cached songs still available</span>
        </>
      ) : (
        <>
          <Wifi size={15} />
          <span>Back online — syncing…</span>
        </>
      )}
    </div>
  )
}

export default OfflineBanner
