// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import playerReducer from './slices/playerSlice'
import userReducer from './slices/userSlice'
import playlistReducer from './slices/playlistSlice'
import libraryReducer from './slices/librarySlice'

export const store = configureStore({
  reducer: {
    player: playerReducer,
    user: userReducer,
    playlist: playlistReducer,
    library: libraryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store