import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { setUser, clearUser } from './store/slices/userSlice'
import AppRouter from './routes/AppRouter'
import Sidebar from './components/Sidebar/Sidebar'
import Player from './components/Player/Player'
import { Toaster } from 'react-hot-toast'

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL
        }))
      } else {
        dispatch(clearUser())
      }
    })
    return () => unsubscribe()
  }, [dispatch])

  return (
    <div className="min-h-screen bg-spotify-black">
      {user && <Sidebar />}
      <div className={`${user ? 'ml-64' : ''} min-h-screen`}>
        <AppRouter />
      </div>
      {user && <Player />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#282828',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  )
}

export default App