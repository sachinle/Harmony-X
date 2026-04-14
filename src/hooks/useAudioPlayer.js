import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { audioService } from '../services/audioService'
import { getAudioUrl } from '../services/storageService'
import { useToast } from './useToast'
import { store } from '../store'
import {
  setIsPlaying, setCurrentTime, setDuration, setIsBuffering,
  nextSong, previousSong, clearSleepTimer,
} from '../store/slices/playerSlice'
import {
  getCachedAudio, cacheAudioFile, recordSongPlay,
} from '../services/cacheService'
import { addToListeningHistory } from '../services/supabase'

export const useAudioPlayer = () => {
  const dispatch = useDispatch()
  const { showError } = useToast()
  const { currentSong, isPlaying, volume, quality, isDataSaverMode } =
    useSelector((s) => s.player)
  const { user } = useSelector((s) => s.user)

  // ── Wire audioService events → Redux (once on mount) ─────────────────────
  useEffect(() => {
    const onTime = (t) => {
      dispatch(setCurrentTime(t))
      const { sleepTimerEnd } = store.getState().player
      if (sleepTimerEnd && Date.now() >= sleepTimerEnd) {
        audioService.pause()
        dispatch(setIsPlaying(false))
        dispatch(clearSleepTimer())
      }
    }
    const onDuration  = (d) => dispatch(setDuration(d))
    const onBuffering = (b) => dispatch(setIsBuffering(b))
    const onCanPlay   = ()  => dispatch(setIsBuffering(false))
    const onPlay      = (p) => dispatch(setIsPlaying(p))
    const onError     = ()  => {
      dispatch(setIsPlaying(false))
      showError('Could not play this song. Audio file not found.')
    }
    const onEnded = () => {
      const { repeatMode, sleepTimerEnd } = store.getState().player
      if (sleepTimerEnd && Date.now() >= sleepTimerEnd) {
        dispatch(setIsPlaying(false))
        dispatch(clearSleepTimer())
        return
      }
      if (repeatMode === 'one') {
        audioService.seekTo(0)
        audioService.play()
      } else {
        dispatch(nextSong())
      }
    }

    audioService.on('timeupdate', onTime)
    audioService.on('duration',   onDuration)
    audioService.on('buffering',  onBuffering)
    audioService.on('canplay',    onCanPlay)
    audioService.on('play',       onPlay)
    audioService.on('ended',      onEnded)
    audioService.on('error',      onError)

    return () => {
      audioService.off('timeupdate', onTime)
      audioService.off('duration',   onDuration)
      audioService.off('buffering',  onBuffering)
      audioService.off('canplay',    onCanPlay)
      audioService.off('play',       onPlay)
      audioService.off('ended',      onEnded)
      audioService.off('error',      onError)
    }
  }, [dispatch])

  // ── Load song: CACHE-FIRST, then network ──────────────────────────────────
  useEffect(() => {
    if (!currentSong?.id) return

    const load = async () => {
      // 1️⃣  Check IndexedDB / Cache API — works fully offline
      const cachedUrl = await getCachedAudio(currentSong.id)
      if (cachedUrl) {
        audioService.loadSong(cachedUrl, true)
        recordSongPlay(currentSong.id).catch(() => {})
        if (user) addToListeningHistory(user.uid, currentSong.id).catch(() => {})
        return
      }

      // 2️⃣  Nothing cached — need network
      if (!navigator.onLine) {
        showError("This song isn't saved for offline. Connect to internet to play it.")
        dispatch(setIsPlaying(false))
        return
      }

      // 3️⃣  Resolve the network URL
      if (!currentSong.file_key && !currentSong.audio_url) return
      const q   = isDataSaverMode ? '32' : quality
      const url = getAudioUrl(currentSong.file_key, q, currentSong.audio_url)
      if (!url) return

      audioService.loadSong(url, true)
      recordSongPlay(currentSong.id).catch(() => {})
      if (user) addToListeningHistory(user.uid, currentSong.id).catch(() => {})

      // 4️⃣  Background-cache for future offline use (fire-and-forget)
      cacheAudioFile(currentSong.id, url, 4).catch(() => {})
    }

    load()
  }, [currentSong?.id, quality, isDataSaverMode])

  // ── Sync volume ───────────────────────────────────────────────────────────
  useEffect(() => { audioService.setVolume(volume) }, [volume])

  const playPause    = useCallback(() => {
    audioService.isPlaying() ? audioService.pause() : audioService.play()
  }, [])
  const seek         = useCallback((time) => {
    audioService.seekTo(time)
    dispatch(setCurrentTime(time))
  }, [dispatch])
  const changeVolume = useCallback((v) => audioService.setVolume(v), [])
  const playNext     = useCallback(() => dispatch(nextSong()),     [dispatch])
  const playPrev     = useCallback(() => dispatch(previousSong()), [dispatch])

  return { playPause, seek, changeVolume, playNext, playPrev }
}
