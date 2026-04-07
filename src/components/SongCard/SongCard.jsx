// src/components/SongCard/SongCard.jsx
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Play, Pause, Download, MoreHorizontal, Check } from 'lucide-react'
import { setCurrentSong, setCurrentPlaylist, setIsPlaying } from '../../store/slices/playerSlice'
import { cacheAudioFile, isSongCached } from '../../services/cacheService'
import toast from 'react-hot-toast'

const SongCard = ({ song, playlist = null, index = 0 }) => {
  const dispatch = useDispatch()
  const { currentSong, isPlaying } = useSelector((state) => state.player)
  const [isCached, setIsCached] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const isCurrentSong = currentSong?.id === song.id

  const handlePlay = () => {
    if (playlist) {
      dispatch(setCurrentPlaylist(playlist))
      dispatch(setCurrentSong(song))
      dispatch(setIsPlaying(true))
    } else {
      dispatch(setCurrentSong(song))
      dispatch(setIsPlaying(true))
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await cacheAudioFile(song.id, song.audioUrl_128, 3)
      setIsCached(true)
      toast.success(`${song.title} saved offline!`)
    } catch (error) {
      toast.error('Failed to cache song')
    } finally {
      setIsDownloading(false)
    }
  }

  React.useEffect(() => {
    const checkCache = async () => {
      const cached = await isSongCached(song.id)
      setIsCached(cached)
    }
    checkCache()
  }, [song.id])

  return (
    <div className="song-card group">
      <div className="relative">
        <img 
          src={song.cover_url || '/default-cover.jpg'} 
          alt={song.title}
          className="w-full aspect-square rounded-md object-cover mb-4"
        />
        <button 
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          {isCurrentSong && isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-0.5" />}
        </button>
      </div>
      
      <div>
        <h3 className="text-white font-medium truncate">{song.title}</h3>
        <p className="text-spotify-light-gray text-sm truncate">{song.artist}</p>
      </div>
      
      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleDownload}
          disabled={isDownloading || isCached}
          className="text-spotify-light-gray hover:text-white transition-colors"
        >
          {isCached ? <Check size={18} className="text-spotify-green" /> : <Download size={18} />}
        </button>
        <button className="text-spotify-light-gray hover:text-white transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  )
}

export default SongCard