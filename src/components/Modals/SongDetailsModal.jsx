import React from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  X, Play, Pause, Heart, HeartOff, ListPlus, Clock,
  Music2, Calendar, BarChart2, Tag,
} from 'lucide-react'
import { playSongFromPlaylist, addToQueue } from '../../store/slices/playerSlice'
import { addLikedSong, removeLikedSong } from '../../store/slices/librarySlice'
import { likeSong, unlikeSong } from '../../services/supabase'
import { formatDuration } from '../../utils/formatters'
import PlayingAnimation from '../Player/PlayingAnimation'
import toast from 'react-hot-toast'

const InfoRow = ({ icon, label, value }) => (
  value ? (
    <div className="flex items-center gap-3 py-2 border-b border-white/5">
      <span className="text-spotify-light-gray flex-shrink-0">{icon}</span>
      <span className="text-spotify-light-gray text-sm w-20 flex-shrink-0">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  ) : null
)

const SongDetailsModal = ({ song, onClose }) => {
  const dispatch = useDispatch()
  const { currentSong, isPlaying } = useSelector((s) => s.player)
  const { likedSongIds } = useSelector((s) => s.library)
  const { user } = useSelector((s) => s.user)

  const isCurrentSong = currentSong?.id === song.id
  const isLiked       = likedSongIds.includes(song.id)

  const handlePlay = () => {
    dispatch(playSongFromPlaylist({ song, playlist: [song], index: 0 }))
    onClose()
  }

  const handleQueue = () => {
    dispatch(addToQueue(song))
    toast.success(`Added "${song.title}" to queue`)
    onClose()
  }

  const handleLike = async () => {
    if (!user) { toast.error('Please log in'); return }
    try {
      if (isLiked) {
        await unlikeSong(user.uid, song.id)
        dispatch(removeLikedSong(song.id))
        toast.success('Removed from Liked Songs')
      } else {
        await likeSong(user.uid, song.id)
        dispatch(addLikedSong(song))
        toast.success('Added to Liked Songs')
      }
    } catch { toast.error('Could not update liked songs') }
  }

  const createdAt = song.created_at
    ? new Date(song.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover art + overlay */}
        <div className="relative">
          <img
            src={song.cover_url || `https://picsum.photos/400/400?random=${song.id}`}
            alt={song.title}
            className="w-full aspect-square object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
          >
            <X size={16} />
          </button>

          {/* Playing indicator */}
          {isCurrentSong && (
            <div className="absolute top-4 left-4">
              <PlayingAnimation isPlaying={isPlaying} size="md" />
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
            <h2 className="text-white font-black text-2xl truncate">{song.title}</h2>
            <p className="text-white/80 text-sm">{song.artist}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-spotify-green text-black font-bold px-5 py-2 rounded-full hover:bg-spotify-green-hover transition text-sm"
          >
            {isCurrentSong && isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" />}
            {isCurrentSong && isPlaying ? 'Playing' : 'Play'}
          </button>
          <button
            onClick={handleQueue}
            className="flex items-center gap-2 bg-white/10 text-white font-bold px-5 py-2 rounded-full hover:bg-white/20 transition text-sm"
          >
            <ListPlus size={16} /> Queue
          </button>
          <button
            onClick={handleLike}
            className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center transition hover:scale-110 ${
              isLiked ? 'bg-spotify-green/20 text-spotify-green' : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            {isLiked ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
          </button>
        </div>

        {/* Metadata */}
        <div className="px-6 py-4">
          <InfoRow icon={<Music2 size={14} />}   label="Album"    value={song.album} />
          <InfoRow icon={<Tag size={14} />}       label="Genre"    value={song.genre} />
          <InfoRow icon={<Clock size={14} />}     label="Duration" value={formatDuration(song.duration)} />
          <InfoRow icon={<Calendar size={14} />}  label="Added"    value={createdAt} />
          {song.play_count > 0 && (
            <InfoRow icon={<BarChart2 size={14} />} label="Plays" value={song.play_count.toLocaleString()} />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SongDetailsModal
