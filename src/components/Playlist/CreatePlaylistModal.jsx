import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPlaylist } from '../../services/supabase'
import { addPlaylist } from '../../store/slices/playlistSlice'
import toast from 'react-hot-toast'

const CreatePlaylistModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const newPlaylist = await createPlaylist(user.uid, name)
      dispatch(addPlaylist(newPlaylist))
      toast.success('Playlist created!')
      setName('')
      onClose()
    } catch (error) {
      toast.error('Failed to create playlist')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-spotify-dark rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Create Playlist</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-spotify-gray text-white px-4 py-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-spotify-green"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded border border-spotify-light-gray text-spotify-light-gray hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-spotify-green text-black font-bold py-2 rounded hover:bg-spotify-green-hover"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePlaylistModal