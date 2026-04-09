import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { setUser, clearUser } from './store/slices/userSlice'
import { setLikedSongs } from './store/slices/librarySlice'
import { setPlaylists } from './store/slices/playlistSlice'
import { setIsPlaying, setCurrentSong } from './store/slices/playerSlice'
import { upsertUser, fetchLikedSongs, fetchUserPlaylists } from './services/supabase'
import { audioService } from './services/audioService'
import AppRouter from './routes/AppRouter'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import Player from './components/Player/Player'
import BottomNav from './components/Navigation/BottomNav'
import NowPlaying from './pages/NowPlaying'
import Loader from './components/Loader/Loader'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const [showMobilePlayer, setShowMobilePlayer] = useState(false)
  const [sidebarOpen, setSidebarOpen]           = useState(false)
  const [authLoading, setAuthLoading]           = useState(true)

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
        await upsertUser(userData.uid, userData.name, userData.email)
        try {
          const [liked, playlists] = await Promise.all([
            fetchLikedSongs(userData.uid),
            fetchUserPlaylists(userData.uid),
          ])
          dispatch(setLikedSongs(liked))
          dispatch(setPlaylists(playlists))
        } catch (e) { console.error('Failed to load user library:', e) }
      } else {
        // ── Stop audio immediately on logout ──────────────────────────
        audioService.pause()
        dispatch(setIsPlaying(false))
        dispatch(setCurrentSong(null))
        dispatch(clearUser())
        setShowMobilePlayer(false)
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [dispatch])

  if (authLoading) return <Loader />

  return (
    <div className="bg-spotify-black" style={{ minHeight: '100dvh' }}>

      {/* Desktop sidebar */}
      {user && (
        <div className="hidden md:block fixed left-0 top-0 bottom-0 z-20 w-[240px]">
          <Sidebar />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {user && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 md:hidden animate-slide-left">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main content column ─────────────────────────────────────── */}
      <div className={`${user ? 'md:ml-[240px]' : ''} flex flex-col`} style={{ minHeight: '100dvh' }}>
        {user && <Navbar onMenuClick={() => setSidebarOpen(true)} />}

        {/*
          Push content below:
            – desktop: 56px navbar (h-14) + status-bar safe area
            – mobile:  56px navbar + status-bar safe area
          Push content above bottom:
            – desktop: 90px player bar
            – mobile:  ~108px bottom nav strip (mini-player + tabs)
        */}
        <main
          className={`flex-1 overflow-y-auto no-scrollbar ${user ? 'md:pb-[90px] pb-[108px]' : ''}`}
          style={user ? { paddingTop: 'calc(56px + var(--sat))' } : {}}
        >
          <AppRouter />
        </main>
      </div>

      {/* Desktop player bar */}
      {user && <Player />}

      {/* Mobile bottom nav */}
      {user && (
        <BottomNav onOpenPlayer={() => setShowMobilePlayer(true)} />
      )}

      {/* Mobile full-screen player */}
      {showMobilePlayer && (
        <NowPlaying onClose={() => setShowMobilePlayer(false)} />
      )}

      <Toaster
        position="top-center"
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

      <Analytics />
    </div>
  )
}

export default App
