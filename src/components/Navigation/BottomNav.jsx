import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Library, Play, Pause, SkipForward } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setIsPlaying } from '../../store/slices/playerSlice'
import { audioService } from '../../services/audioService'
import PlayingAnimation from '../Player/PlayingAnimation'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

const BottomNav = ({ onOpenPlayer }) => {
  const dispatch = useDispatch()
  const { currentSong, isPlaying } = useSelector((s) => s.player)
  const { playPause, playNext } = useAudioPlayer()

  const tabs = [
    { to: '/',        icon: <Home size={22} />,    label: 'Home',    end: true },
    { to: '/search',  icon: <Search size={22} />,  label: 'Search' },
    { to: '/library', icon: <Library size={22} />, label: 'Library' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black border-t border-white/10">

      {/* Mini player strip */}
      {currentSong && (
        <div className="flex items-center gap-2 w-full px-3 py-2 bg-[#1db954]/10 border-b border-white/5">

          {/* Cover + song info → tap opens full player */}
          <button
            onClick={onOpenPlayer}
            className="flex items-center gap-3 flex-1 min-w-0 active:opacity-80 transition"
          >
            <div className="relative flex-shrink-0">
              <img
                src={currentSong.cover_url || 'https://picsum.photos/40/40'}
                alt={currentSong.title}
                className="w-11 h-11 rounded-lg object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 rounded-lg bg-black/30 flex items-center justify-center">
                  <PlayingAnimation isPlaying size="sm" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-white/50 text-xs truncate">{currentSong.artist}</p>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); playPause() }}
              className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              {isPlaying
                ? <Pause size={22} fill="white" />
                : <Play  size={22} fill="white" className="ml-0.5" />
              }
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); playNext() }}
              className="w-10 h-10 flex items-center justify-center text-white/70 active:scale-90 transition-transform"
            >
              <SkipForward size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Nav tabs */}
      <div
        className="flex items-center justify-around px-2 pt-2"
        style={{ paddingBottom: 'calc(8px + var(--sab))' }}
      >
        {tabs.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                isActive ? 'text-white' : 'text-spotify-light-gray'
              }`
            }
          >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default BottomNav
