import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  X, Monitor, Smartphone, Tablet, Volume2, Radio,
  Play, Pause, SkipForward, SkipBack,
} from 'lucide-react'
import { setShowDevices } from '../../store/slices/playerSlice'
import { fetchDeviceSessions } from '../../services/supabase'
import { DEVICE_ID, DEVICE_NAME, useDeviceSync } from '../../hooks/useDeviceSync'

const DeviceIcon = ({ name, className = '' }) => {
  if (/mobile/i.test(name))  return <Smartphone size={20} className={className} />
  if (/tablet/i.test(name))  return <Tablet     size={20} className={className} />
  return <Monitor size={20} className={className} />
}

const DevicePanel = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.user)
  const { showDevices, isPlaying, currentSong } = useSelector((s) => s.player)

  const [sessions, setSessions]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [remoteVolumes, setRemoteVolumes] = useState({})
  const [cmdPending, setCmdPending]       = useState({})

  const { transferHere, sendCommand } = useDeviceSync()

  const refresh = useCallback(() => {
    if (!user?.uid) return
    fetchDeviceSessions(user.uid).then(setSessions)
  }, [user?.uid])

  useEffect(() => {
    if (!showDevices || !user?.uid) return
    setLoading(true)
    fetchDeviceSessions(user.uid).then((s) => { setSessions(s); setLoading(false) })
    const iv = setInterval(refresh, 5000)
    return () => clearInterval(iv)
  }, [showDevices, user?.uid, refresh])

  // Seed volume sliders from session data
  useEffect(() => {
    const vols = {}
    sessions.forEach((s) => { if (s.device_id !== DEVICE_ID) vols[s.device_id] = s.volume ?? 1 })
    setRemoteVolumes((prev) => ({ ...vols, ...prev }))
  }, [sessions])

  if (!showDevices) return null

  const otherDevices = sessions.filter((s) => s.device_id !== DEVICE_ID)

  const cmd = async (deviceId, command, extra = {}) => {
    setCmdPending((p) => ({ ...p, [deviceId]: true }))
    await sendCommand(deviceId, command, extra)
    setTimeout(() => { setCmdPending((p) => ({ ...p, [deviceId]: false })); refresh() }, 600)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => dispatch(setShowDevices(false))} />

      <div className="fixed bottom-[100px] right-4 w-[340px] max-h-[70vh] bg-[#1a1a1a] rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-spotify-green" />
            <h3 className="text-white font-bold text-sm">Devices</h3>
          </div>
          <button onClick={() => dispatch(setShowDevices(false))} className="text-white/50 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar px-4 py-4 space-y-4">

          {/* This device */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">This device</p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-spotify-green/10 border border-spotify-green/20">
              <DeviceIcon name={DEVICE_NAME} className="text-spotify-green" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{DEVICE_NAME}</p>
                {currentSong
                  ? <p className="text-spotify-green text-xs truncate">{isPlaying ? '▶ ' : '⏸ '}{currentSong.title}</p>
                  : <p className="text-white/40 text-xs">No song playing</p>
                }
              </div>
              {isPlaying && <Volume2 size={16} className="text-spotify-green flex-shrink-0" />}
            </div>
          </div>

          {/* Other devices */}
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : otherDevices.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-white/50 text-sm">No other active devices</p>
              <p className="text-white/25 text-xs mt-1">Open Harmony X on another device</p>
            </div>
          ) : (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Other devices</p>
              <div className="space-y-3">
                {otherDevices.map((session) => {
                  const song = session.song_data
                    ? (typeof session.song_data === 'string' ? JSON.parse(session.song_data) : session.song_data)
                    : null
                  const vol  = remoteVolumes[session.device_id] ?? 1
                  const busy = !!cmdPending[session.device_id]

                  return (
                    <div key={session.device_id} className="bg-white/5 rounded-xl p-3 space-y-3">

                      {/* Device info + transfer */}
                      <div className="flex items-center gap-3">
                        <DeviceIcon name={session.device_name} className="text-white/60" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{session.device_name}</p>
                          {song
                            ? <p className="text-white/50 text-xs truncate">{session.is_playing ? '▶ ' : '⏸ '}{song.title}</p>
                            : <p className="text-white/30 text-xs">Idle</p>
                          }
                        </div>
                        <button
                          onClick={() => { transferHere(session); dispatch(setShowDevices(false)) }}
                          className="text-[10px] font-bold text-spotify-green border border-spotify-green/40 rounded-full px-2.5 py-1 hover:bg-spotify-green/10 transition whitespace-nowrap"
                        >
                          Play here
                        </button>
                      </div>

                      {/* Remote controls (only if song is active) */}
                      {song && (
                        <>
                          {/* Transport */}
                          <div className="flex items-center justify-center gap-4">
                            <button disabled={busy} onClick={() => cmd(session.device_id, 'PREV')}
                              className="text-white/60 hover:text-white active:scale-90 transition disabled:opacity-40">
                              <SkipBack size={20} />
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => cmd(session.device_id, 'PLAY_PAUSE', { playing: !session.is_playing })}
                              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow disabled:opacity-40"
                            >
                              {session.is_playing
                                ? <Pause size={18} fill="black" />
                                : <Play  size={18} fill="black" className="ml-0.5" />
                              }
                            </button>
                            <button disabled={busy} onClick={() => cmd(session.device_id, 'NEXT')}
                              className="text-white/60 hover:text-white active:scale-90 transition disabled:opacity-40">
                              <SkipForward size={20} />
                            </button>
                          </div>

                          {/* Volume */}
                          <div className="flex items-center gap-2">
                            <Volume2 size={14} className="text-white/40 flex-shrink-0" />
                            <input
                              type="range" min="0" max="1" step="0.01"
                              value={vol}
                              onChange={(e) => setRemoteVolumes((p) => ({ ...p, [session.device_id]: +e.target.value }))}
                              onMouseUp={(e) => cmd(session.device_id, 'VOLUME', { value: +e.target.value })}
                              onTouchEnd={(e) => cmd(session.device_id, 'VOLUME', { value: +e.currentTarget.value })}
                              className="flex-1 h-1 accent-spotify-green cursor-pointer"
                            />
                            <span className="text-white/30 text-xs w-8 text-right">{Math.round(vol * 100)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DevicePanel
