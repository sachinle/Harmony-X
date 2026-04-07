// src/hooks/useAudioPlayer.js
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { audioService } from '../services/audioService'
import { 
  setIsPlaying, 
  setCurrentTime, 
  setDuration, 
  setIsBuffering,
  nextSong,
  previousSong 
} from '../store/slices/playerSlice'
import { recordSongPlay } from '../services/cacheService'
import { addToListeningHistory } from '../services/supabase'

export const useAudioPlayer = () => {
  const dispatch = useDispatch()
  const { currentSong, currentPlaylist, currentIndex, isPlaying, volume, quality, isDataSaverMode } = 
    useSelector((state) => state.player)
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    // Setup audio service listeners
    audioService.on('timeupdate', (time) => {
      dispatch(setCurrentTime(time))
    })
    
    audioService.on('ended', () => {
      dispatch(nextSong())
    })
    
    audioService.on('canplay', () => {
      dispatch(setIsBuffering(false))
    })
    
    audioService.on('buffering', (isBuffering) => {
      dispatch(setIsBuffering(isBuffering))
    })
    
    audioService.on('play', (playing) => {
      dispatch(setIsPlaying(playing))
    })
    
    audioService.on('duration', (duration) => {
      dispatch(setDuration(duration))
    })
    
    return () => {
      audioService.off('timeupdate', () => {})
      audioService.off('ended', () => {})
      audioService.off('canplay', () => {})
    }
  }, [dispatch])

  useEffect(() => {
    if (currentSong) {
      const qualityParam = isDataSaverMode ? '32' : quality
      const audioUrl = currentSong[`audioUrl_${qualityParam}`] || currentSong.audioUrl_128
      
      audioService.loadSong(audioUrl, isPlaying)
      
      // Record play for smart caching
      recordSongPlay(currentSong.id)
      
      // Add to listening history if user is logged in
      if (user) {
        addToListeningHistory(user.uid, currentSong.id)
      }
    }
  }, [currentSong, quality, isDataSaverMode])

  useEffect(() => {
    audioService.setVolume(volume)
  }, [volume])

  useEffect(() => {
    audioService.setDataSaverMode(isDataSaverMode)
  }, [isDataSaverMode])

  const playPause = useCallback(() => {
    if (audioService.isPlaying()) {
      audioService.pause()
    } else {
      audioService.play()
    }
  }, [])

  const seek = useCallback((time) => {
    audioService.seekTo(time)
  }, [])

  const changeVolume = useCallback((newVolume) => {
    audioService.setVolume(newVolume)
  }, [])

  const playNext = useCallback(() => {
    dispatch(nextSong())
  }, [dispatch])

  const playPrevious = useCallback(() => {
    dispatch(previousSong())
  }, [dispatch])

  return {
    playPause,
    seek,
    changeVolume,
    playNext,
    playPrevious,
    isPlaying: audioService.isPlaying(),
    currentTime: audioService.getCurrentTime(),
    duration: audioService.getDuration(),
  }
}