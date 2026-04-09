import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Play } from 'lucide-react'
import SongCard from '../components/SongCard/SongCard'
import SongCardSkeleton from '../components/SongCard/SongCardSkeleton'
import { fetchSongs, fetchListeningHistory } from '../services/supabase'
import { playSongFromPlaylist } from '../store/slices/playerSlice'
import PullToRefresh from '../components/PullToRefresh/PullToRefresh'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const QuickCard = ({ title, coverUrl, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group w-full"
  >
    <img src={coverUrl} alt={title} className="w-16 h-16 object-cover flex-shrink-0" />
    <span className="text-white font-semibold text-sm truncate pr-4">{title}</span>
    <div className="ml-auto mr-4 w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
      <Play size={18} fill="black" className="ml-0.5" />
    </div>
  </button>
)

const Home = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const [recentSongs, setRecentSongs]     = useState([])
  const [featuredSongs, setFeaturedSongs] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => { loadData() }, [user?.uid])

  const loadData = async () => {
    setLoading(true)
    try {
      const songs = await fetchSongs()
      setFeaturedSongs(songs)
      if (user) {
        const history = await fetchListeningHistory(user.uid, 10)
        setRecentSongs(history.filter(Boolean))
      }
    } catch (e) {
      console.error('Home load error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="px-8 pb-36 pt-2">
    <div className="px-8 pb-36 pt-2">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-6">
          {user ? `${getGreeting()}, ${user.name.split(' ')[0]}` : 'Welcome to Harmony X'}
        </h1>

        {recentSongs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {recentSongs.slice(0, 6).map((song) => (
              <QuickCard
                key={song.id}
                title={song.title}
                coverUrl={song.cover_url || 'https://picsum.photos/64/64'}
                onClick={() => dispatch(playSongFromPlaylist({ song, playlist: recentSongs, index: recentSongs.indexOf(song) }))}
              />
            ))}
          </div>
        )}
      </div>

      {recentSongs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-white text-2xl font-bold mb-4">Recently played</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => <SongCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {recentSongs.map((song, i) => (
                <SongCard key={song.id} song={song} playlist={recentSongs} index={i} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-white text-2xl font-bold mb-4">{user ? 'Made for you' : 'Popular songs'}</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => <SongCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {featuredSongs.map((song, i) => (
              <SongCard key={song.id} song={song} playlist={featuredSongs} index={i} />
            ))}
          </div>
        )}
      </section>

      {featuredSongs.length > 0 && !loading && (
        <button
          onClick={() => dispatch(playSongFromPlaylist({ song: featuredSongs[0], playlist: featuredSongs, index: 0 }))}
          className="flex items-center gap-2 bg-spotify-green text-black font-bold px-6 py-3 rounded-full hover:bg-spotify-green-hover transition hover:scale-105"
        >
          <Play size={18} fill="black" />
          Play All Songs
        </button>
      )}
    </div>
    </div>
    </PullToRefresh>
  )
}

export default Home