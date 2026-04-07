import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setQuality, setIsDataSaverMode } from '../../store/slices/playerSlice'
import { Settings, Wifi, WifiOff } from 'lucide-react'

const QualitySelector = () => {
  const dispatch = useDispatch()
  const { quality, isDataSaverMode } = useSelector((state) => state.player)
  const [isOpen, setIsOpen] = React.useState(false)

  const qualities = [
    { value: '32', label: 'Low (32 kbps) - Data saver' },
    { value: '64', label: 'Medium (64 kbps)' },
    { value: '128', label: 'High (128 kbps)' },
    { value: '320', label: 'Very High (320 kbps)' },
  ]

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="player-button flex items-center gap-1"
      >
        <Settings size={18} />
        <span className="text-xs">{quality} kbps</span>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-spotify-dark rounded-md shadow-lg p-2 w-48 z-50">
          <button
            onClick={() => {
              dispatch(setIsDataSaverMode(!isDataSaverMode))
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-spotify-gray rounded flex items-center gap-2"
          >
            {isDataSaverMode ? <WifiOff size={16} /> : <Wifi size={16} />}
            Data Saver Mode {isDataSaverMode ? 'ON' : 'OFF'}
          </button>
          <div className="border-t border-spotify-gray my-1"></div>
          {qualities.map((q) => (
            <button
              key={q.value}
              onClick={() => {
                dispatch(setQuality(q.value))
                if (q.value === '32') dispatch(setIsDataSaverMode(true))
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-spotify-gray rounded ${
                quality === q.value ? 'text-spotify-green' : 'text-white'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default QualitySelector