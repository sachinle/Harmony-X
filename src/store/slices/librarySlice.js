import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  songs: [],
  likedSongs: [],
  recentlyPlayed: [],
  isLoading: false,
}

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setSongs: (state, action) => {
      state.songs = action.payload
    },
    setLikedSongs: (state, action) => {
      state.likedSongs = action.payload
    },
    setRecentlyPlayed: (state, action) => {
      state.recentlyPlayed = action.payload
    },
    addToRecentlyPlayed: (state, action) => {
      const exists = state.recentlyPlayed.some(song => song.id === action.payload.id)
      if (!exists) {
        state.recentlyPlayed = [action.payload, ...state.recentlyPlayed].slice(0, 20)
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
})

export const { 
  setSongs, setLikedSongs, setRecentlyPlayed, 
  addToRecentlyPlayed, setLoading 
} = librarySlice.actions

export default librarySlice.reducer