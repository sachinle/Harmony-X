import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Monitor, Smartphone, Tablet, Volume2, Radio } from 'lucide-react'
import { setShowDevices } from '../../store/slices/playerSlice'
import { fetchDeviceSessions } from '../../services/supabase'
import { DEVICE_ID, DEVICE_NAME, useDeviceSync } from '../../hooks/useDeviceSync'

const DeviceIcon = ({ name }) => {
  if (/mobile/i.test(name))  return <Smartphone size={20} />
  if (/tablet/i.test(name))  return <Tablet size={20} />
  return <Monitor size={20} />
}

const DevicePanel = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.user)
  const { showDevices, isPlaying, currentSong } = useSelector((s) => s.player)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(false)
  const { transferHere } = useDeviceSync()

  useEffect(() => {
    if (!showDevices || !user?.uid) return
    setLoading(true)
    fetchDeviceSessions(user.uid)
      .then(setSessions)
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      fetchDeviceSessions(user.uid).then(setSessions)
    }, 5000)
    return () => clearInterval(interval)
  }, [showDevices, user?.uid])

  if (!showDevices) return null

  const thisDevice = sessions.find(s => s.device_id === DEVICE_ID)
  const otherDevices = sessions.filter(s => s.device_id !== DEVICE_ID)

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => dispatch(setShowDevices(false))}
      />
      <div className="fixed bottom-[100px] right-4 w-[320px] bg-[#282828] rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-spotify-green" />
            <h3 className="text-white font-bold">Connect to a device</h3>
          </div>
          <button
            onClick={() => dispatch(setShowDevices(false))}
            className="text-spotify-light-gray hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Current device */}
          <p className="text-spotify-light-gray text-xs uppercase tracking-wider font-bold mb-3">This device</p>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-4">
            <div className="text-spotify-green">
              <DeviceIcon name={DEVICE_NAME} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{DEVICE_NAME}</p>
              {currentSong && isPlaying && (
                <p className="text-spotify-green text-xs truncate">{currentSong.title}</p>
              )}
              {(!currentSong || !isPlaying) && (
                <p className="text-spotify-light-gray text-xs">Ready</p>
              )}
            </div>
            {isPlaying && (
              <Volume2 size={16} className="text-spotify-green flex-shrink-0" />
            )}
          </div>

          {/* Other devices */}
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : otherDevices.length > 0 ? (
            <>
              <p className="text-spotify-light-gray text-xs uppercase tracking-wider font-bold mb-3">Other devices</p>
              <div className="space-y-2">
                {otherDevices.map((session) => {
                  const sessionSong = session.song_data
                    ? (typeof session.song_data === 'string' ? JSON.parse(session.song_data) : session.song_data)
                    : null
                  return (
                    <button
                      key={session.device_id}
                      onClick={() => { transferHere(session); dispatch(setShowDevices(false)) }}
                      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition text-left group"
                    >
                      <div className="text-spotify-light-gray group-hover:text-white transition">
                        <DeviceIcon name={session.device_name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{session.device_name}</p>
                        {sessionSong ? (
                          <p className="text-spotify-light-gray text-xs truncate">
                            {session.is_playing ? '▶ ' : '⏸ '}{sessionSong.title}
                          </p>
                        ) : (
                          <p className="text-spotify-light-gray text-xs">Idle</p>
                        )}
                      </div>
                      <span className="text-spotify-green text-xs opacity-0 group-hover:opacity-100 transition">
                        Transfer here
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-spotify-light-gray text-sm">No other active devices</p>
              <p className="text-white/30 text-xs mt-1">Open Harmony X on another device to see it here</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DevicePanel
