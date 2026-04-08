import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setIsPlaying, setVolume } from '../store/slices/playerSlice'
import { upsertDeviceSession, removeDeviceSession, supabase } from '../services/supabase'

const getDeviceId = () => {
  let id = localStorage.getItem('hx_device_id')
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem('hx_device_id', id)
  }
  return id
}

const getDeviceName = () => {
  let name = localStorage.getItem('hx_device_name')
  if (!name) {
    const ua = navigator.userAgent
    if (/mobile/i.test(ua))      name = 'Mobile'
    else if (/tablet/i.test(ua)) name = 'Tablet'
    else                          name = 'Desktop'
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) name += ' · Chrome'
    else if (/safari/i.test(ua))                 name += ' · Safari'
    else if (/firefox/i.test(ua))                name += ' · Firefox'
    else if (/edg/i.test(ua))                    name += ' · Edge'
    localStorage.setItem('hx_device_name', name)
  }
  return name
}

export const DEVICE_ID   = getDeviceId()
export const DEVICE_NAME = getDeviceName()

export const useDeviceSync = () => {
  const dispatch        = useDispatch()
  const channelRef      = useRef(null)
  const syncThrottleRef = useRef(null)
  // Use a unique suffix per hook mount so StrictMode re-mounts get a fresh name
  const channelSuffixRef = useRef(`${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)

  const { user }                           = useSelector((s) => s.user)
  const { currentSong, isPlaying, volume } = useSelector((s) => s.player)

  // Push current playback state to Supabase (throttled)
  const pushState = useCallback(() => {
    if (!user?.uid) return
    if (syncThrottleRef.current) clearTimeout(syncThrottleRef.current)
    syncThrottleRef.current = setTimeout(() => {
      upsertDeviceSession(user.uid, DEVICE_ID, DEVICE_NAME, {
        song_data:  currentSong ? JSON.stringify(currentSong) : null,
        is_playing: isPlaying,
        volume,
      })
    }, 500)
  }, [user?.uid, currentSong?.id, isPlaying, volume])

  useEffect(() => { pushState() }, [pushState])

  // Subscribe to realtime — use unique channel name to survive StrictMode double-mount
  useEffect(() => {
    if (!user?.uid) return

    // Tear down any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channelName = `device_sync:${user.uid}:${channelSuffixRef.current}`

    // Build channel: .on() MUST come before .subscribe()
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'device_sessions',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const row = payload.new
          if (!row || row.device_id === DEVICE_ID) return
          if (typeof row.volume === 'number')      dispatch(setVolume(row.volume))
          if (typeof row.is_playing === 'boolean') dispatch(setIsPlaying(row.is_playing))
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      removeDeviceSession(user.uid, DEVICE_ID).catch(() => {})
    }
  }, [user?.uid, dispatch])

  const transferHere = useCallback(async (remoteSession) => {
    if (!user?.uid || !remoteSession) return
    try {
      const song = typeof remoteSession.song_data === 'string'
        ? JSON.parse(remoteSession.song_data)
        : remoteSession.song_data
      console.log('Transfer playback here:', song?.title)
    } catch (e) {
      console.error('transferHere error:', e)
    }
  }, [user?.uid, dispatch])

  return { deviceId: DEVICE_ID, deviceName: DEVICE_NAME, transferHere }
}