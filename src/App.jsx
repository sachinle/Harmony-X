import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { setUser, clearUser } from './store/slices/userSlice'
import { setLikedSongs } from './store/slices/librarySlice'
import { setPlaylists } from './store/slices/playlistSlice'
import { upsertUser, fetchLikedSongs, fetchUserPlaylists } from './services/supabase'
import AppRouter from './routes/AppRouter'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import Player from './components/Player/Player'
import { Toaster } from 'react-hot-toast'

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid:      firebaseUser.uid,
          email:    firebaseUser.email,
          name:     firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
        }
        dispatch(setUser(userData))

        // Ensure user row exists in Supabase
        await upsertUser(userData.uid, userData.name, userData.email, userData.photoURL)

        // Pre-load liked songs & playlists into Redux
        try {
          const [liked, playlists] = await Promise.all([
            fetchLikedSongs(userData.uid),
            fetchUserPlaylists(userData.uid),
          ])
          dispatch(setLikedSongs(liked))
          dispatch(setPlaylists(playlists))
        } catch (e) {
          console.error('Failed to load user library:', e)
        }
      } else {
        dispatch(clearUser())
      }
    })
    return () => unsubscribe()
  }, [dispatch])

  return (
    <div className="min-h-screen bg-spotify-black">
      {user && <Sidebar />}
      <div className={`${user ? 'ml-[240px]' : ''} min-h-screen flex flex-col`}>
        {user && <Navbar />}
        <main className={`flex-1 ${user ? 'pt-16' : ''}`}>
          <AppRouter />
        </main>
      </div>
      {user && <Player />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#282828',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid #333',
          },
          success: { iconTheme: { primary: '#1DB954', secondary: '#000' } },
        }}
      />
    </div>
  )
}

export default App
