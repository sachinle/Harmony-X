import React, { useState, useEffect, useCallback } from 'react'
import { Search as SearchIcon, X, ChevronLeft } from 'lucide-react'
import SongCard from '../components/SongCard/SongCard'
import SongCardSkeleton from '../components/SongCard/SongCardSkeleton'
import { supabase } from '../services/supabase'

const BROWSE_CATEGORIES = [
  { label: 'Pop',         color: 'from-pink-500 to-rose-600',     img: 'https://picsum.photos/200/200?random=10', emoji: '🎤' },
  { label: 'Hip-Hop',    color: 'from-yellow-500 to-orange-600', img: 'https://picsum.photos/200/200?random=11', emoji: '🎧' },
  { label: 'Electronic', color: 'from-blue-500 to-indigo-600',   img: 'https://picsum.photos/200/200?random=12', emoji: '🎛️' },
  { label: 'Rock',        color: 'from-red-600 to-gray-800',      img: 'https://picsum.photos/200/200?random=13', emoji: '🎸' },
  { label: 'Jazz',        color: 'from-amber-500 to-yellow-700',  img: 'https://picsum.photos/200/200?random=14', emoji: '🎷' },
  { label: 'Classical',   color: 'from-purple-500 to-violet-700', img: 'https://picsum.photos/200/200?random=15', emoji: '🎻' },
  { label: 'R&B',         color: 'from-teal-500 to-emerald-700',  img: 'https://picsum.photos/200/200?random=16', emoji: '🎵' },
  { label: 'Chill',       color: 'from-sky-400 to-cyan-600',      img: 'https://picsum.photos/200/200?random=17', emoji: '🌊' },
]

const Search = () => {
  const [query, setQuery]                   = useState('')
  const [results, setResults]               = useState([])
  const [loading, setLoading]               = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [activeGenre, setActiveGenre]       = useState(null)
  const [genreSongs, setGenreSongs]         = useState([])
  const [genreLoading, setGenreLoading]     = useState(false)
  const inputRef = React.useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('hx_recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    setActiveGenre(null)
    try {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${q}%,artist.ilike.%${q}%,album.ilike.%${q}%,genre.ilike.%${q}%`)
        .limit(50)
      setResults(data || [])
      const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 6)
      setRecentSearches(updated)
      localStorage.setItem('hx_recentSearches', JSON.stringify(updated))
    } catch (e) {
      console.error('Search failed:', e)
    } finally {
      setLoading(false)
    }
  }, [recentSearches])

  const browseGenre = async (genre) => {
    setActiveGenre(genre)
    setQuery('')
    setResults([])
    setGenreLoading(true)
    try {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .ilike('genre', genre)
        .order('created_at', { ascending: false })
      setGenreSongs(data || [])
    } catch (e) {
      console.error('Genre browse failed:', e)
    } finally {
      setGenreLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') runSearch(query) }

  const removeRecent = (term, e) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('hx_recentSearches', JSON.stringify(updated))
  }

  const clearAll = () => {
    setQuery('')
    setResults([])
    setActiveGenre(null)
    setGenreSongs([])
  }

  const hasQuery  = query.trim().length > 0
  const activecat = BROWSE_CATEGORIES.find(c => c.label === activeGenre)

  return (
    <div className="px-4 md:px-8 pb-36 pt-6">
      {/* Search bar */}
      <div className="max-w-xl mb-8">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 text-black" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Artists, songs, or podcasts"
            className="w-full bg-white text-black font-medium pl-11 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500 text-sm"
          />
          {(hasQuery || activeGenre) && (
            <button onClick={clearAll} className="absolute right-3 text-gray-500 hover:text-black">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Genre detail view */}
      {activeGenre && !hasQuery && (
        <div>
          <button
            onClick={() => { setActiveGenre(null); setGenreSongs([]) }}
            className="flex items-center gap-1 text-spotify-light-gray hover:text-white mb-6 text-sm transition"
          >
            <ChevronLeft size={16} /> Browse all
          </button>

          <div className={`flex items-center gap-4 mb-8 p-6 rounded-xl bg-gradient-to-br ${activecat?.color}`}>
            <span className="text-5xl">{activecat?.emoji}</span>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider font-bold mb-1">Genre</p>
              <h1 className="text-white font-black text-3xl">{activeGenre}</h1>
            </div>
          </div>

          {genreLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[...Array(8)].map((_, i) => <SongCardSkeleton key={i} />)}
            </div>
          ) : genreSongs.length > 0 ? (
            <>
              <p className="text-white/60 text-sm mb-4">{genreSongs.length} song{genreSongs.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {genreSongs.map((song, i) => (
                  <SongCard key={song.id} song={song} playlist={genreSongs} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-white text-xl font-bold mb-2">No {activeGenre} songs yet</p>
              <p className="text-spotify-light-gray text-sm">Check back later or add songs with this genre.</p>
            </div>
          )}
        </div>
      )}

      {/* Default view: recents + browse categories */}
      {!hasQuery && !activeGenre && (
        <>
          {recentSearches.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-bold">Recent searches</h2>
                <button
                  onClick={() => { setRecentSearches([]); localStorage.removeItem('hx_recentSearches') }}
                  className="text-spotify-light-gray hover:text-white text-sm transition"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-2 px-4 py-2 bg-[#282828] rounded-full text-white text-sm hover:bg-[#333] cursor-pointer group transition"
                    onClick={() => { setQuery(term); runSearch(term) }}
                  >
                    <span>{term}</span>
                    <button
                      onClick={(e) => removeRecent(term, e)}
                      className="text-spotify-light-gray hover:text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-white text-xl font-bold mb-4">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {BROWSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => browseGenre(cat.label)}
                  className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 h-24 md:h-28 relative overflow-hidden hover:brightness-110 transition text-left`}
                >
                  <span className="text-white font-bold text-base md:text-lg relative z-10 block">{cat.label}</span>
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="absolute -bottom-2 -right-2 w-16 h-16 md:w-20 md:h-20 rounded-lg rotate-12 shadow-xl object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Search results */}
      {hasQuery && (
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[...Array(10)].map((_, i) => <SongCardSkeleton key={i} />)}
            </div>
          ) : results.length > 0 ? (
            <>
              <h2 className="text-white text-xl font-bold mb-4">
                Results for "{query}" <span className="text-spotify-light-gray font-normal text-base">({results.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {results.map((song, i) => (
                  <SongCard key={song.id} song={song} playlist={results} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-white text-2xl font-bold mb-2">No results found</p>
              <p className="text-spotify-light-gray">Try a different keyword or browse by genre.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
