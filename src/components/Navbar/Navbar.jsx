import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, User, Settings, LogOut, Menu } from 'lucide-react'
import { logout } from '../../services/firebase'
import { clearUser } from '../../store/slices/userSlice'

const Navbar = ({ onMenuClick }) => {
  const { user }  = useSelector((state) => state.user)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    dispatch(clearUser())
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="fixed top-0 left-0 md:left-[240px] right-0 z-30 h-16 flex items-center justify-between px-4 md:px-8 bg-[#121212] border-b border-white/5 pointer-events-none">
      {/* Mobile hamburger + Back/Forward */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition"
        >
          <Menu size={18} />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex w-8 h-8 rounded-full bg-black/60 items-center justify-center text-white hover:bg-black/80 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="hidden md:flex w-8 h-8 rounded-full bg-black/60 items-center justify-center text-white hover:bg-black/80 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* User menu */}
      <div className="relative pointer-events-auto" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-black/60 hover:bg-black/80 rounded-full pl-1 pr-3 py-1 transition"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold text-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-white text-sm font-medium">{user.name}</span>
          <ChevronLeft size={14} className={`text-white transition-transform ${open ? 'rotate-90' : '-rotate-90'}`} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-[#282828] rounded-md shadow-2xl py-1 border border-white/10 z-50">
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-spotify-light-gray text-xs truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { navigate('/account'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-spotify-light-gray hover:text-white hover:bg-white/10 transition"
            >
              <Settings size={16} />
              Account settings
            </button>
            <button
              onClick={() => { navigate('/profile'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-spotify-light-gray hover:text-white hover:bg-white/10 transition"
            >
              <User size={16} />
              Profile
            </button>
            <div className="my-1 border-t border-white/10" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-spotify-light-gray hover:text-white hover:bg-white/10 transition"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar