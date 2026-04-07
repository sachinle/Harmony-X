// src/store/slices/playlistSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playlists: [],
  currentPlaylist: null,
  currentPlaylistSongs: [],
  isLoading: false,
}

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylists: (state, action) => {
      state.playlists = action.payload
    },
    addPlaylist: (state, action) => {
      state.playlists.unshift(action.payload)
    },
    removePlaylist: (state, action) => {
      state.playlists = state.playlists.filter(p => p.id !== action.payload)
    },
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload
    },
    setCurrentPlaylistSongs: (state, action) => {
      state.currentPlaylistSongs = action.payload
    },
    addSongToCurrentPlaylist: (state, action) => {
      state.currentPlaylistSongs.push(action.payload)
    },
    removeSongFromCurrentPlaylist: (state, action) => {
      state.currentPlaylistSongs = state.currentPlaylistSongs.filter(
        song => song.id !== action.payload
      )
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setPlaylists,
  addPlaylist,
  removePlaylist,
  setCurrentPlaylist,
  setCurrentPlaylistSongs,
  addSongToCurrentPlaylist,
  removeSongFromCurrentPlaylist,
  setLoading,
} = playlistSlice.actions

export default playlistSlice.reducer