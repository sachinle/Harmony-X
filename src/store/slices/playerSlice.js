import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentSong: null,
  currentPlaylist: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  quality: '128',
  isDataSaverMode: false,
  isBuffering: false,
  repeatMode: 'off',   // 'off' | 'one' | 'all'
  isShuffled: false,
  shuffledPlaylist: [],
  // Queue: songs to play after the current one, before returning to the playlist
  queue: [],
  // Sleep timer: ms timestamp when playback should stop (null = off)
  sleepTimerEnd: null,
  // Show panels
  showQueue: false,
  showDevices: false,
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playSongFromPlaylist: (state, action) => {
      const { song, playlist, index } = action.payload
      state.currentSong     = song
      state.currentPlaylist = playlist
      state.isPlaying       = true
      if (state.isShuffled) {
        state.shuffledPlaylist = [...playlist].sort(() => Math.random() - 0.5)
        const si = state.shuffledPlaylist.findIndex(s => s.id === song.id)
        state.currentIndex = si !== -1 ? si : 0
      } else {
        state.currentIndex = index >= 0 ? index : playlist.findIndex(s => s.id === song.id)
      }
    },
    setCurrentSong:     (state, action) => { state.currentSong     = action.payload },
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload
      if (state.isShuffled)
        state.shuffledPlaylist = [...action.payload].sort(() => Math.random() - 0.5)
    },
    setCurrentIndex:    (state, action) => { state.currentIndex    = action.payload },
    setIsPlaying:       (state, action) => { state.isPlaying       = action.payload },
    setVolume:          (state, action) => { state.volume          = Math.max(0, Math.min(1, action.payload)) },
    setCurrentTime:     (state, action) => { state.currentTime     = action.payload },
    setDuration:        (state, action) => { state.duration        = action.payload },
    setQuality:         (state, action) => { state.quality         = action.payload },
    setIsDataSaverMode: (state, action) => { state.isDataSaverMode = action.payload },
    setIsBuffering:     (state, action) => { state.isBuffering     = action.payload },

    toggleRepeat: (state) => {
      const modes = ['off', 'one', 'all']
      state.repeatMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length]
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled
      if (state.isShuffled && state.currentPlaylist.length > 0) {
        state.shuffledPlaylist = [...state.currentPlaylist].sort(() => Math.random() - 0.5)
        const si = state.shuffledPlaylist.findIndex(s => s.id === state.currentSong?.id)
        state.currentIndex = si !== -1 ? si : 0
      } else if (!state.isShuffled) {
        const idx = state.currentPlaylist.findIndex(s => s.id === state.currentSong?.id)
        state.currentIndex = idx !== -1 ? idx : 0
      }
    },

    // ── Queue ────────────────────────────────────────────────────────────
    addToQueue: (state, action) => {
      // action.payload can be a single song or array of songs
      const songs = Array.isArray(action.payload) ? action.payload : [action.payload]
      state.queue.push(...songs)
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter((_, i) => i !== action.payload)
    },
    clearQueue: (state) => { state.queue = [] },
    reorderQueue: (state, action) => {
      const { from, to } = action.payload
      const [item] = state.queue.splice(from, 1)
      state.queue.splice(to, 0, item)
    },
    playFromQueue: (state) => {
      if (state.queue.length === 0) return
      const [next, ...rest] = state.queue
      state.queue       = rest
      state.currentSong = next
      state.isPlaying   = true
    },

    // ── Panel visibility ─────────────────────────────────────────────────
    toggleQueuePanel:   (state) => { state.showQueue   = !state.showQueue   },
    toggleDevicePanel:  (state) => { state.showDevices = !state.showDevices },
    setShowQueue:       (state, action) => { state.showQueue   = action.payload },
    setShowDevices:     (state, action) => { state.showDevices = action.payload },

    // ── Sleep timer ──────────────────────────────────────────────────────
    setSleepTimer: (state, action) => { state.sleepTimerEnd = action.payload },
    clearSleepTimer: (state) => { state.sleepTimerEnd = null },

    nextSong: (state) => {
      if (state.repeatMode === 'one') { state.isPlaying = true; return }
      // Check queue first
      if (state.queue.length > 0) {
        const [next, ...rest] = state.queue
        state.queue       = rest
        state.currentSong = next
        state.isPlaying   = true
        return
      }
      const playlist = state.isShuffled ? state.shuffledPlaylist : state.currentPlaylist
      if (!playlist.length) return
      let next = state.currentIndex + 1
      if (next >= playlist.length) {
        if (state.repeatMode === 'all') next = 0; else { state.isPlaying = false; return }
      }
      state.currentIndex = next
      state.currentSong  = playlist[next]
      state.isPlaying    = true
    },
    previousSong: (state) => {
      const playlist = state.isShuffled ? state.shuffledPlaylist : state.currentPlaylist
      if (!playlist.length) return
      let prev = state.currentIndex - 1
      if (prev < 0) {
        if (state.repeatMode === 'all') prev = playlist.length - 1; else return
      }
      state.currentIndex = prev
      state.currentSong  = playlist[prev]
      state.isPlaying    = true
    },
  },
})

export const {
  playSongFromPlaylist, setCurrentSong, setCurrentPlaylist, setCurrentIndex,
  setIsPlaying, setVolume, setCurrentTime, setDuration, setQuality,
  setIsDataSaverMode, setIsBuffering, toggleRepeat, toggleShuffle,
  nextSong, previousSong,
  addToQueue, removeFromQueue, clearQueue, reorderQueue, playFromQueue,
  toggleQueuePanel, toggleDevicePanel, setShowQueue, setShowDevices,
  setSleepTimer, clearSleepTimer,
} = playerSlice.actions

export default playerSlice.reducer
