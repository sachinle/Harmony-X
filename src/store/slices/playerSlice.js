// src/store/slices/playerSlice.js
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
  repeatMode: 'off', // 'off', 'one', 'all'
  isShuffled: false,
  shuffledPlaylist: [],
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload
    },
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload
      if (state.isShuffled) {
        state.shuffledPlaylist = [...action.payload].sort(() => Math.random() - 0.5)
      }
    },
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload
    },
    setVolume: (state, action) => {
      state.volume = Math.max(0, Math.min(1, action.payload))
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload
    },
    setDuration: (state, action) => {
      state.duration = action.payload
    },
    setQuality: (state, action) => {
      state.quality = action.payload
    },
    setIsDataSaverMode: (state, action) => {
      state.isDataSaverMode = action.payload
    },
    setIsBuffering: (state, action) => {
      state.isBuffering = action.payload
    },
    toggleRepeat: (state) => {
      const modes = ['off', 'one', 'all']
      const currentIndex = modes.indexOf(state.repeatMode)
      state.repeatMode = modes[(currentIndex + 1) % modes.length]
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled
      if (state.isShuffled && state.currentPlaylist.length > 0) {
        state.shuffledPlaylist = [...state.currentPlaylist].sort(() => Math.random() - 0.5)
        // Find current song in shuffled playlist
        const newIndex = state.shuffledPlaylist.findIndex(
          song => song.id === state.currentSong?.id
        )
        state.currentIndex = newIndex !== -1 ? newIndex : 0
      } else if (!state.isShuffled && state.currentPlaylist.length > 0) {
        const newIndex = state.currentPlaylist.findIndex(
          song => song.id === state.currentSong?.id
        )
        state.currentIndex = newIndex !== -1 ? newIndex : 0
      }
    },
    nextSong: (state) => {
      const playlist = state.isShuffled ? state.shuffledPlaylist : state.currentPlaylist
      let nextIndex = state.currentIndex + 1
      if (nextIndex >= playlist.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0
        } else {
          return
        }
      }
      state.currentIndex = nextIndex
      state.currentSong = playlist[nextIndex]
      state.isPlaying = true
    },
    previousSong: (state) => {
      const playlist = state.isShuffled ? state.shuffledPlaylist : state.currentPlaylist
      let prevIndex = state.currentIndex - 1
      if (prevIndex < 0 && state.repeatMode === 'all') {
        prevIndex = playlist.length - 1
      }
      if (prevIndex >= 0) {
        state.currentIndex = prevIndex
        state.currentSong = playlist[prevIndex]
        state.isPlaying = true
      }
    },
  },
})

export const {
  setCurrentSong,
  setCurrentPlaylist,
  setCurrentIndex,
  setIsPlaying,
  setVolume,
  setCurrentTime,
  setDuration,
  setQuality,
  setIsDataSaverMode,
  setIsBuffering,
  toggleRepeat,
  toggleShuffle,
  nextSong,
  previousSong,
} = playerSlice.actions

export default playerSlice.reducer