import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, Library, Music2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import PlayingAnimation from '../Player/PlayingAnimation'

const BottomNav = ({ onOpenPlayer }) => {
  const { currentSong, isPlaying } = useSelector((s) => s.player)

  const tabs = [
    { to: '/',        icon: <Home size={22} />,    label: 'Home',    end: true },
    { to: '/search',  icon: <Search size={22} />,  label: 'Search' },
    { to: '/library', icon: <Library size={22} />, label: 'Library' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black border-t border-white/10">
      {/* Mini player strip (above tabs) */}
      {currentSong && (
        <button
          onClick={onOpenPlayer}
          className="flex items-center gap-3 w-full px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] transition active:scale-[0.99] border-b border-white/5"
        >
          <img
            src={currentSong.cover_url || 'https://picsum.photos/40/40'}
            alt={currentSong.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-spotify-light-gray text-xs truncate">{currentSong.artist}</p>
          </div>
          {isPlaying
            ? <PlayingAnimation isPlaying size="sm" />
            : <Music2 size={16} className="text-spotify-light-gray" />
          }
        </button>
      )}

      {/* Nav tabs */}
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {tabs.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                isActive ? 'text-white' : 'text-spotify-light-gray hover:text-white'
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
