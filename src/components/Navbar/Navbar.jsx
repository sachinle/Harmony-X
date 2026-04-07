import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../services/firebase'
import { clearUser } from '../../store/slices/userSlice'
import { ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    dispatch(clearUser())
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="fixed top-0 right-0 left-64 z-30 bg-spotify-black/80 backdrop-blur-md px-8 py-3 flex justify-end items-center">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-spotify-dark rounded-full px-3 py-1 hover:bg-spotify-gray transition"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-white text-sm">{user.name}</span>
          <ChevronDown size={16} className="text-spotify-light-gray" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-spotify-dark rounded-md shadow-lg py-1 z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-spotify-light-gray hover:bg-spotify-gray hover:text-white flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar