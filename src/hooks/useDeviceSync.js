import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setIsPlaying, setVolume, playSongFromPlaylist, nextSong, previousSong,
} from '../store/slices/playerSlice'
import { audioService } from '../services/audioService'
import { upsertDeviceSession, removeDeviceSession, supabase } from '../services/supabase'

// ── Stable device identity (persisted in localStorage) ────────────────────────
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
  const dispatch = useDispatch()

  const suffixRef    = useRef(`${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)
  const stateChRef   = useRef(null)
  const controlChRef = useRef(null)
  const throttleRef  = useRef(null)

  const { user }                           = useSelector((s) => s.user)
  const { currentSong, isPlaying, volume } = useSelector((s) => s.player)

  // ── Push local state to DB (throttled 500 ms) ─────────────────────────────
  const pushState = useCallback(() => {
    if (!user?.uid) return
    if (throttleRef.current) clearTimeout(throttleRef.current)
    throttleRef.current = setTimeout(() => {
      upsertDeviceSession(user.uid, DEVICE_ID, DEVICE_NAME, {
        song_data:  currentSong ? JSON.stringify(currentSong) : null,
        is_playing: isPlaying,
        volume,
      })
    }, 500)
  }, [user?.uid, currentSong?.id, isPlaying, volume])

  useEffect(() => { pushState() }, [pushState])

  // ── Postgres changes: passive state sync across devices ───────────────────
  useEffect(() => {
    if (!user?.uid) return
    if (stateChRef.current) { supabase.removeChannel(stateChRef.current); stateChRef.current = null }

    const ch = supabase
      .channel(`device_sync:${user.uid}:${suffixRef.current}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'device_sessions',
        filter: `user_id=eq.${user.uid}`,
      }, (payload) => {
        const row = payload.new
        if (!row || row.device_id === DEVICE_ID) return
        if (typeof row.volume     === 'number')  dispatch(setVolume(row.volume))
        if (typeof row.is_playing === 'boolean') dispatch(setIsPlaying(row.is_playing))
      })
      .subscribe()

    stateChRef.current = ch
    return () => { if (stateChRef.current) { supabase.removeChannel(stateChRef.current); stateChRef.current = null } }
  }, [user?.uid, dispatch])

  // ── Broadcast channel: low-latency remote control commands ────────────────
  useEffect(() => {
    if (!user?.uid) return
    if (controlChRef.current) { supabase.removeChannel(controlChRef.current); controlChRef.current = null }

    const ch = supabase
      .channel(`controls:${user.uid}`)
      .on('broadcast', { event: 'cmd' }, ({ payload }) => {
        if (payload?.target !== DEVICE_ID) return
        switch (payload.command) {
          case 'PLAY_PAUSE':
            if (payload.playing) { audioService.play(); dispatch(setIsPlaying(true)) }
            else                 { audioService.pause(); dispatch(setIsPlaying(false)) }
            break
          case 'NEXT':  dispatch(nextSong()); break
          case 'PREV':  dispatch(previousSong()); break
          case 'VOLUME':
            audioService.setVolume(payload.value)
            dispatch(setVolume(payload.value))
            break
          case 'TRANSFER':
            try {
              const song = typeof payload.song === 'string' ? JSON.parse(payload.song) : payload.song
              if (song) dispatch(playSongFromPlaylist({ song, playlist: [song], index: 0 }))
            } catch {}
            break
          default: break
        }
      })
      .subscribe()

    controlChRef.current = ch
    return () => {
      if (controlChRef.current) { supabase.removeChannel(controlChRef.current); controlChRef.current = null }
      removeDeviceSession(user.uid, DEVICE_ID).catch(() => {})
    }
  }, [user?.uid, dispatch])

  // ── Send command to a specific remote device via broadcast ────────────────
  const sendCommand = useCallback(async (targetDeviceId, command, extra = {}) => {
    if (!user?.uid) return
    const ch = supabase.channel(`controls:${user.uid}`)
    await ch.send({ type: 'broadcast', event: 'cmd', payload: { target: targetDeviceId, command, ...extra } })
  }, [user?.uid])

  // ── Transfer: play remote device's song here, pause remote device ─────────
  const transferHere = useCallback(async (remoteSession) => {
    if (!user?.uid || !remoteSession) return
    try {
      const song = typeof remoteSession.song_data === 'string'
        ? JSON.parse(remoteSession.song_data) : remoteSession.song_data
      if (song) {
        dispatch(playSongFromPlaylist({ song, playlist: [song], index: 0 }))
        await sendCommand(remoteSession.device_id, 'PLAY_PAUSE', { playing: false })
      }
    } catch (e) { console.error('transferHere error:', e) }
  }, [user?.uid, dispatch, sendCommand])

  return { deviceId: DEVICE_ID, deviceName: DEVICE_NAME, transferHere, sendCommand }
}
