import React, { useState, useEffect, useCallback } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import SongCard from '../components/SongCard/SongCard'
import SongCardSkeleton from '../components/SongCard/SongCardSkeleton'
import { supabase } from '../services/supabase'

const BROWSE_CATEGORIES = [
  { label: 'Pop',         color: 'from-pink-500 to-rose-600',     img: 'https://picsum.photos/200/200?random=10' },
  { label: 'Hip-Hop',    color: 'from-yellow-500 to-orange-600', img: 'https://picsum.photos/200/200?random=11' },
  { label: 'Electronic', color: 'from-blue-500 to-indigo-600',   img: 'https://picsum.photos/200/200?random=12' },
  { label: 'Rock',        color: 'from-red-600 to-gray-800',      img: 'https://picsum.photos/200/200?random=13' },
  { label: 'Jazz',        color: 'from-amber-500 to-yellow-700',  img: 'https://picsum.photos/200/200?random=14' },
  { label: 'Classical',   color: 'from-purple-500 to-violet-700', img: 'https://picsum.photos/200/200?random=15' },
  { label: 'R&B',         color: 'from-teal-500 to-emerald-700',  img: 'https://picsum.photos/200/200?random=16' },
  { label: 'Chill',       color: 'from-sky-400 to-cyan-600',      img: 'https://picsum.photos/200/200?random=17' },
]

const Search = () => {
  const [query, setQuery]                   = useState('')
  const [results, setResults]               = useState([])
  const [loading, setLoading]               = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('hx_recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${q}%,artist.ilike.%${q}%,album.ilike.%${q}%`)
        .limit(50)
      setResults(data || [])
      const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('hx_recentSearches', JSON.stringify(updated))
    } catch (e) {
      console.error('Search failed:', e)
    } finally {
      setLoading(false)
    }
  }, [recentSearches])

  const handleKeyDown = (e) => { if (e.key === 'Enter') runSearch(query) }

  const removeRecent = (term, e) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('hx_recentSearches', JSON.stringify(updated))
  }

  const hasQuery = query.trim().length > 0

  return (
    <div className="px-8 pb-36 pt-6">
      {/* Search bar */}
      <div className="max-w-xl mb-8">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 text-black" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to listen to?"
            className="w-full bg-white text-black font-medium pl-11 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500 text-sm"
          />
          {hasQuery && (
            <button onClick={() => { setQuery(''); setResults([]) }} className="absolute right-3 text-gray-500 hover:text-black">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches */}
      {!hasQuery && recentSearches.length > 0 && (
        <div className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4">Recent searches</h2>
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

      {/* Browse categories */}
      {!hasQuery && (
        <div>
          <h2 className="text-white text-xl font-bold mb-4">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                onClick={() => { setQuery(cat.label); runSearch(cat.label) }}
                className={`bg-gradient-to-br ${cat.color} rounded-lg p-4 h-28 relative overflow-hidden cursor-pointer hover:brightness-110 transition`}
              >
                <span className="text-white font-bold text-lg relative z-10">{cat.label}</span>
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute -bottom-2 -right-2 w-20 h-20 rounded-lg rotate-12 shadow-xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
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
              <p className="text-spotify-light-gray">No songs found for "{query}".</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
