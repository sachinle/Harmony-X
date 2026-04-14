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
import {
  cacheUserData, getCachedUserData,
  processSyncQueue,
} from './services/cacheService'
import { likeSong, unlikeSong, addSongToPlaylist } from './services/supabase'
import AppRouter from './routes/AppRouter'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import Player from './components/Player/Player'
import BottomNav from './components/Navigation/BottomNav'
import NowPlaying from './pages/NowPlaying'
import Loader from './components/Loader/Loader'
import OfflineBanner from './components/OfflineBanner/OfflineBanner'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const [showMobilePlayer, setShowMobilePlayer] = useState(false)
  const [sidebarOpen, setSidebarOpen]           = useState(false)
  const [authLoading, setAuthLoading]           = useState(true)

  useEffect(() => {
    // Safety timeout: if Firebase doesn't respond in 5 s (deep offline),
    // stop the loader so the app is still usable with cached data.
    const timeout = setTimeout(() => setAuthLoading(false), 5000)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout)

      if (firebaseUser) {
        const userData = {
          uid:      firebaseUser.uid,
          email:    firebaseUser.email,
          name:     firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
        }
        dispatch(setUser(userData))

        // upsertUser is a write — silently skip when offline
        if (navigator.onLine) {
          upsertUser(userData.uid, userData.name, userData.email).catch(() => {})
        }

        // ── Network-first, IndexedDB fallback ────────────────────────────────
        if (navigator.onLine) {
          try {
            const [liked, playlists] = await Promise.all([
              fetchLikedSongs(userData.uid),
              fetchUserPlaylists(userData.uid),
            ])
            dispatch(setLikedSongs(liked))
            dispatch(setPlaylists(playlists))
            // Persist for next offline session
            cacheUserData(userData.uid, 'liked',     liked).catch(() => {})
            cacheUserData(userData.uid, 'playlists', playlists).catch(() => {})
          } catch (e) {
            console.warn('Failed to fetch library online, falling back to cache:', e)
            loadFromCache(userData.uid)
          }
          // Replay any queued offline actions now that we're online
          processSyncQueue({
            like:          (item) => likeSong(item.uid, item.songId),
            unlike:        (item) => unlikeSong(item.uid, item.songId),
            addToPlaylist: (item) => addSongToPlaylist(item.playlistId, item.songId),
          }).catch(() => {})
        } else {
          // Fully offline — load from IndexedDB cache
          loadFromCache(userData.uid)
        }
      } else {
        // Logged out — stop audio and clear state
        audioService.pause()
        dispatch(setIsPlaying(false))
        dispatch(setCurrentSong(null))
        dispatch(clearUser())
        setShowMobilePlayer(false)
      }

      setAuthLoading(false)
    })

    const loadFromCache = async (uid) => {
      const [liked, playlists] = await Promise.all([
        getCachedUserData(uid, 'liked'),
        getCachedUserData(uid, 'playlists'),
      ])
      if (liked)     dispatch(setLikedSongs(liked))
      if (playlists) dispatch(setPlaylists(playlists))
    }

    return () => { clearTimeout(timeout); unsubscribe() }
  }, [dispatch])

  if (authLoading) return <Loader />

  return (
    <div className="bg-spotify-black" style={{ minHeight: '100dvh' }}>

      {/* Global offline indicator */}
      <OfflineBanner />

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

      {/* Main content column */}
      <div className={`${user ? 'md:ml-[240px]' : ''} flex flex-col`} style={{ minHeight: '100dvh' }}>
        {user && <Navbar onMenuClick={() => setSidebarOpen(true)} />}

        <main
          className={`flex-1 overflow-y-auto no-scrollbar ${user ? 'md:pb-[90px] pb-[120px]' : ''}`}
          style={user ? { paddingTop: 'calc(56px + var(--sat))' } : {}}
        >
          <AppRouter />
        </main>
      </div>

      {/* Desktop player bar */}
      {user && <Player />}

      {/* Mobile bottom nav */}
      {user && <BottomNav onOpenPlayer={() => setShowMobilePlayer(true)} />}

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
