import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ListPlus, PlayCircle, Heart, HeartOff, Info,
  Plus, ChevronRight, Download, CheckCircle,
} from 'lucide-react'
import { addToQueue } from '../../store/slices/playerSlice'
import { setLikedSongs } from '../../store/slices/librarySlice'
import { addPlaylist } from '../../store/slices/playlistSlice'
import { likeSong, unlikeSong, addSongToPlaylist, createPlaylist } from '../../services/supabase'
import { getAudioUrl } from '../../services/storageService'
import { cacheAudioFile, isSongCached } from '../../services/cacheService'
import toast from 'react-hot-toast'

const SongContextMenu = ({ song, triggerRef, onClose, onShowDetails, onPlay }) => {
  const dispatch   = useDispatch()
  const menuRef    = useRef(null)
  const [pos, setPos]               = useState({ top: 0, left: 0 })
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [isDownloaded, setIsDownloaded]   = useState(false)

  const { user }      = useSelector((s) => s.user)
  const { playlists } = useSelector((s) => s.playlist)
  const { likedSongs } = useSelector((s) => s.library)
  const isLiked = likedSongs?.some((s) => s.id === song.id) ?? false

  // Position the menu near the trigger button
  useEffect(() => {
    if (!triggerRef?.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuWidth  = 220
    const menuHeight = 320
    let top  = rect.bottom + 4
    let left = rect.left

    if (left + menuWidth > window.innerWidth)   left = rect.right - menuWidth
    if (top  + menuHeight > window.innerHeight) top  = rect.top - menuHeight - 4

    setPos({ top, left })
  }, [triggerRef])

  // Check if song is already downloaded
  useEffect(() => {
    isSongCached(song.id).then(setIsDownloaded).catch(() => {})
  }, [song.id])

  // Close on outside click or Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef?.current && !triggerRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose, triggerRef])

  const handleAddToQueue = () => {
    dispatch(addToQueue(song))
    toast.success(`Added "${song.title}" to queue`)
    onClose()
  }

  const handleLike = async () => {
    if (!user) { toast.error('Please log in'); onClose(); return }
    try {
      if (isLiked) {
        await unlikeSong(user.uid, song.id)
        dispatch(setLikedSongs(likedSongs.filter(s => s.id !== song.id)))
        toast.success('Removed from Liked Songs')
      } else {
        await likeSong(user.uid, song.id)
        dispatch(setLikedSongs([...likedSongs, song]))
        toast.success('Added to Liked Songs')
      }
    } catch { toast.error('Could not update liked songs') }
    onClose()
  }

  const handleAddToPlaylist = async (playlist) => {
    try {
      await addSongToPlaylist(playlist.id, song.id)
      toast.success(`Added to "${playlist.name}"`)
    } catch { toast.error('Could not add to playlist') }
    onClose()
  }

  const handleCreateAndAdd = async () => {
    if (!user) return
    const name = prompt('New playlist name:')
    if (!name?.trim()) return
    try {
      const pl = await createPlaylist(user.uid, name.trim())
      dispatch(addPlaylist(pl))
      await addSongToPlaylist(pl.id, song.id)
      toast.success(`Created "${pl.name}" and added song`)
    } catch { toast.error('Could not create playlist') }
    onClose()
  }

  const handleDownload = async () => {
    if (isDownloaded) { toast('Already saved for offline'); onClose(); return }
    try {
      const url = getAudioUrl(song.file_key, '128', song.audio_url)
      await cacheAudioFile(song.id, url, 3)
      setIsDownloaded(true)
      toast.success('Saved for offline listening')
    } catch { toast.error('Could not save for offline') }
    onClose()
  }

  const menuItems = [
    {
      icon: <PlayCircle size={16} />,
      label: 'Play now',
      action: () => { onPlay?.(); onClose() },
    },
    {
      icon: <ListPlus size={16} />,
      label: 'Add to queue',
      action: handleAddToQueue,
    },
    { divider: true },
    {
      icon: isLiked ? <HeartOff size={16} /> : <Heart size={16} />,
      label: isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs',
      action: handleLike,
      green: !isLiked,
    },
    {
      icon: <Plus size={16} />,
      label: 'Add to playlist',
      hasSubmenu: true,
      action: () => setShowPlaylists((v) => !v),
    },
    { divider: true },
    {
      icon: <Info size={16} />,
      label: 'Song details',
      action: () => { onShowDetails?.(); onClose() },
    },
    {
      icon: isDownloaded ? <CheckCircle size={16} className="text-green-500" /> : <Download size={16} />,
      label: isDownloaded ? 'Saved offline' : 'Save for offline',
      action: handleDownload,
    },
  ]

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] w-56 bg-[#282828] rounded-lg shadow-2xl border border-white/10 py-1"
      style={{ top: pos.top, left: pos.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Song header */}
      <div className="px-3 py-2 border-b border-white/10 mb-1">
        <p className="text-white text-sm font-semibold truncate">{song.title}</p>
        <p className="text-gray-400 text-xs truncate">{song.artist}</p>
      </div>

      {menuItems.map((item, i) => {
        if (item.divider) return <div key={i} className="border-t border-white/10 my-1" />
        return (
          <button
            key={i}
            onClick={item.action}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors gap-3"
          >
            <span className="flex items-center gap-3">
              <span className={item.green ? 'text-green-500' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </span>
            {item.hasSubmenu && <ChevronRight size={14} className="text-gray-400" />}
          </button>
        )
      })}

      {/* Playlist submenu */}
      {showPlaylists && (
        <div className="border-t border-white/10 mt-1 pt-1">
          <button
            onClick={handleCreateAndAdd}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-green-500 hover:bg-white/10 transition-colors"
          >
            <Plus size={14} /> New playlist
          </button>
          <div className="max-h-36 overflow-y-auto">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors truncate"
              >
                {pl.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}

export default SongContextMenu