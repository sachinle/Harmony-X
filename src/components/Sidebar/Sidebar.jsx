// src/components/Sidebar/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Library, Plus, Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createPlaylist } from '../../services/supabase'
import { addPlaylist } from '../../store/slices/playlistSlice'
import toast from 'react-hot-toast'

const Sidebar = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const { playlists } = useSelector((state) => state.playlist)

  const handleCreatePlaylist = async () => {
    if (!user) {
      toast.error('Please login to create a playlist')
      return
    }
    
    const name = prompt('Enter playlist name:')
    if (name) {
      try {
        const newPlaylist = await createPlaylist(user.uid, name)
        dispatch(addPlaylist(newPlaylist))
        toast.success('Playlist created!')
      } catch (error) {
        toast.error('Failed to create playlist')
      }
    }
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-black z-40 flex flex-col">
      <div className="p-6">
        <h1 className="text-spotify-green text-2xl font-bold">Harmony X</h1>
      </div>
      
      <nav className="flex-1">
        <NavLink to="/" className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/search" className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}>
          <Search size={24} />
          <span>Search</span>
        </NavLink>
        
        <NavLink to="/library" className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}>
          <Library size={24} />
          <span>Your Library</span>
        </NavLink>
      </nav>

      <div className="px-4 py-6">
        <button 
          onClick={handleCreatePlaylist}
          className="flex items-center gap-3 text-spotify-light-gray hover:text-white transition-colors w-full"
        >
          <Plus size={20} />
          <span>Create Playlist</span>
        </button>
        
        <NavLink to="/liked" className="flex items-center gap-3 text-spotify-light-gray hover:text-white transition-colors mt-4">
          <Heart size={20} />
          <span>Liked Songs</span>
        </NavLink>
      </div>

      {/* User's Playlists */}
      {playlists.length > 0 && (
        <div className="px-4 pb-6 overflow-y-auto">
          <div className="border-t border-spotify-gray pt-4">
            {playlists.map((playlist) => (
              <NavLink 
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="block py-2 text-spotify-light-gray hover:text-white text-sm truncate"
              >
                {playlist.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar