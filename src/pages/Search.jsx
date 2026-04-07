// src/pages/Search.jsx
import React, { useState, useEffect } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import SongCard from '../components/SongCard/SongCard'
import { supabase } from '../services/supabase'

const Search = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
        .limit(50)
      
      setResults(data || [])
      
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spotify-light-gray" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search songs, artists, albums..."
            className="w-full bg-spotify-dark text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
        </div>
      </div>

      {recentSearches.length > 0 && !query && (
        <div className="max-w-2xl mx-auto mb-8">
          <h3 className="text-spotify-light-gray mb-2">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term)
                  handleSearch()
                }}
                className="px-4 py-2 bg-spotify-dark rounded-full text-white hover:bg-spotify-gray transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Results for "{query}"
          </h2>
          {loading ? (
            <div className="text-center text-spotify-light-gray">Searching...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center text-spotify-light-gray py-12">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search