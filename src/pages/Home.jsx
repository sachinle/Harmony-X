// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SongCard from '../components/SongCard/SongCard'
import SongCardSkeleton from '../components/SongCard/SongCardSkeleton'
import { fetchSongs, fetchListeningHistory } from '../services/supabase'
import { autoCacheMostPlayed } from '../services/cacheService'

const Home = () => {
  const [recentSongs, setRecentSongs] = useState([])
  const [featuredSongs, setFeaturedSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    loadHomeData()
  }, [user])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      // Fetch all songs
      const songs = await fetchSongs()
      setFeaturedSongs(songs.slice(0, 12))
      
      // Fetch user's listening history for recent songs
      if (user) {
        const history = await fetchListeningHistory(user.uid, 10)
        setRecentSongs(history)
        
        // Trigger smart caching for most played songs
        const songsMap = songs.reduce((acc, song) => ({ ...acc, [song.id]: song }), {})
        await autoCacheMostPlayed(songsMap)
      } else {
        setRecentSongs(songs.slice(0, 6))
      }
    } catch (error) {
      console.error('Failed to load home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome to Harmony X'}
        </h1>
        <p className="text-spotify-light-gray">Your offline-first music experience</p>
      </div>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Featured for You */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Featured for You</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {featuredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home