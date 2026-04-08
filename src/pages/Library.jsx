import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus, List, LayoutGrid, Search } from 'lucide-react'
import PlaylistCard from '../components/Playlist/PlaylistCard'
import { fetchUserPlaylists, createPlaylist } from '../services/supabase'
import { setPlaylists, addPlaylist } from '../store/slices/playlistSlice'
import toast from 'react-hot-toast'

const Library = () => {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { user }   = useSelector((state) => state.user)
  const { playlists } = useSelector((state) => state.playlist)
  const [loading, setLoading]   = useState(false)
  const [view, setView]         = useState('grid')
  const [filter, setFilter]     = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user && playlists.length === 0) loadPlaylists()
  }, [user])

  const loadPlaylists = async () => {
    setLoading(true)
    try {
      const data = await fetchUserPlaylists(user.uid)
      dispatch(setPlaylists(data))
    } catch {
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const name = prompt('Playlist name:')
    if (!name?.trim()) return
    setCreating(true)
    try {
      const pl = await createPlaylist(user.uid, name.trim())
      dispatch(addPlaylist(pl))
      toast.success(`"${pl.name}" created!`)
      navigate(`/playlist/${pl.id}`)
    } catch {
      toast.error('Could not create playlist')
    } finally {
      setCreating(false)
    }
  }

  const filtered = playlists.filter(pl =>
    pl.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="px-8 pb-36 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Your Library</h1>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-8 h-8 flex items-center justify-center text-spotify-light-gray hover:text-white hover:bg-white/10 rounded-full transition"
          title="Create playlist"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Filter + View */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-light-gray" size={14} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter playlists"
            className="w-full bg-[#282828] text-white text-sm pl-9 pr-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-white/30 placeholder-spotify-light-gray"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView('list')} className={`p-2 rounded transition ${view === 'list' ? 'text-white' : 'text-spotify-light-gray hover:text-white'}`}>
            <List size={18} />
          </button>
          <button onClick={() => setView('grid')} className={`p-2 rounded transition ${view === 'grid' ? 'text-white' : 'text-spotify-light-gray hover:text-white'}`}>
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-spotify-light-gray text-sm">Loading playlists…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white font-bold text-xl mb-2">
            {playlists.length === 0 ? 'Create your first playlist' : 'No playlists match'}
          </p>
          <p className="text-spotify-light-gray text-sm mb-6">
            {playlists.length === 0 ? "It's easy, we'll help you" : 'Try a different search term'}
          </p>
          {playlists.length === 0 && (
            <button onClick={handleCreate} className="bg-white text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition">
              Create playlist
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(pl => (
            <div
              key={pl.id}
              onClick={() => navigate(`/playlist/${pl.id}`)}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded bg-[#282828] flex items-center justify-center flex-shrink-0">
                <span className="text-spotify-light-gray text-xl">♫</span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate">{pl.name}</p>
                <p className="text-spotify-light-gray text-xs">Playlist</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Library
