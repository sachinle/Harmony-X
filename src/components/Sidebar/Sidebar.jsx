import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, Library, Plus, Heart, Music2, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createPlaylist, deletePlaylist } from '../../services/supabase'
import { addPlaylist, removePlaylist } from '../../store/slices/playlistSlice'
import toast from 'react-hot-toast'

const Sidebar = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector((state) => state.user)
  const { playlists } = useSelector((state) => state.playlist)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName]   = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const pl = await createPlaylist(user.uid, name)
      dispatch(addPlaylist(pl))
      toast.success(`Playlist "${pl.name}" created!`)
      setNewName('')
      setShowInput(false)
      navigate(`/playlist/${pl.id}`)
    } catch {
      toast.error('Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePlaylist = async (e, id, name) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deletePlaylist(id)
      dispatch(removePlaylist(id))
      toast.success('Playlist deleted')
    } catch {
      toast.error('Failed to delete playlist')
    }
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[240px] bg-black z-40 flex flex-col select-none">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <Music2 className="text-spotify-green" size={28} />
          <span className="text-white text-xl font-bold tracking-tight">Harmony X</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="px-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-white bg-spotify-gray' : 'text-spotify-light-gray hover:text-white'
            }`
          }
        >
          <Home size={22} />
          Home
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-white bg-spotify-gray' : 'text-spotify-light-gray hover:text-white'
            }`
          }
        >
          <Search size={22} />
          Search
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-white bg-spotify-gray' : 'text-spotify-light-gray hover:text-white'
            }`
          }
        >
          <Library size={22} />
          Your Library
        </NavLink>
      </nav>

      <div className="mx-4 my-3 border-t border-white/10" />

      {/* Create Playlist + Liked Songs */}
      <div className="px-2">
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-sm font-medium text-spotify-light-gray hover:text-white transition-colors"
        >
          <div className="w-6 h-6 bg-spotify-light-gray/30 rounded-sm flex items-center justify-center">
            <Plus size={16} />
          </div>
          Create Playlist
        </button>

        {showInput && (
          <form onSubmit={handleCreatePlaylist} className="px-4 pb-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Playlist name…"
              className="w-full bg-spotify-gray text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-spotify-green"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="flex-1 bg-spotify-green text-black text-xs font-bold py-1.5 rounded hover:bg-spotify-green-hover disabled:opacity-50 transition"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowInput(false); setNewName('') }}
                className="flex-1 bg-spotify-gray text-white text-xs font-bold py-1.5 rounded hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <NavLink
          to="/liked"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-white bg-spotify-gray' : 'text-spotify-light-gray hover:text-white'
            }`
          }
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-spotify-green rounded-sm flex items-center justify-center">
            <Heart size={14} fill="white" className="text-white" />
          </div>
          Liked Songs
        </NavLink>
      </div>

      <div className="mx-4 my-2 border-t border-white/10" />

      {/* Playlist list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {playlists.map((pl) => (
          <NavLink
            key={pl.id}
            to={`/playlist/${pl.id}`}
            className={({ isActive }) =>
              `group flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'text-white bg-spotify-gray' : 'text-spotify-light-gray hover:text-white'
              }`
            }
          >
            <span className="truncate">{pl.name}</span>
            <button
              onClick={(e) => handleDeletePlaylist(e, pl.id, pl.name)}
              className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-red-400 transition ml-2 flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
