import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  songs: [],
  likedSongIds: [],
  likedSongs: [],
  recentlyPlayed: [],
  isLoading: false,
}

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setSongs:          (state, action) => { state.songs          = action.payload },
    setLikedSongIds:   (state, action) => { state.likedSongIds   = action.payload },
    setLikedSongs: (state, action) => {
      state.likedSongs   = action.payload
      state.likedSongIds = action.payload.map(s => s.id)
    },
    addLikedSong: (state, action) => {
      const song = action.payload
      if (!state.likedSongIds.includes(song.id)) {
        state.likedSongIds = [song.id, ...state.likedSongIds]
        state.likedSongs   = [song,   ...state.likedSongs]
      }
    },
    removeLikedSong: (state, action) => {
      const id = action.payload
      state.likedSongIds = state.likedSongIds.filter(sid => sid !== id)
      state.likedSongs   = state.likedSongs.filter(s => s.id !== id)
    },
    setRecentlyPlayed: (state, action) => { state.recentlyPlayed = action.payload },
    addToRecentlyPlayed: (state, action) => {
      const exists = state.recentlyPlayed.some(s => s.id === action.payload.id)
      if (!exists)
        state.recentlyPlayed = [action.payload, ...state.recentlyPlayed].slice(0, 20)
    },
    setLoading: (state, action) => { state.isLoading = action.payload },
  },
})

export const {
  setSongs, setLikedSongIds, setLikedSongs,
  addLikedSong, removeLikedSong,
  setRecentlyPlayed, addToRecentlyPlayed, setLoading,
} = librarySlice.actions

export default librarySlice.reducer
