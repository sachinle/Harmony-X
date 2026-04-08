import React from 'react'
import { Link } from 'react-router-dom'

const GRADIENTS = [
  'from-purple-700 to-indigo-900',
  'from-blue-700 to-cyan-900',
  'from-green-700 to-teal-900',
  'from-red-700 to-rose-900',
  'from-amber-600 to-orange-900',
  'from-pink-600 to-fuchsia-900',
]

const PlaylistCard = ({ playlist }) => {
  const grad = GRADIENTS[playlist.name.charCodeAt(0) % GRADIENTS.length]
  return (
    <Link to={`/playlist/${playlist.id}`}>
      <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-200 cursor-pointer group relative">
        <div className={`w-full aspect-square bg-gradient-to-br ${grad} rounded-md mb-4 flex items-center justify-center shadow-lg`}>
          <svg className="w-14 h-14 text-white/70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <h3 className="text-white text-sm font-semibold truncate mb-1">{playlist.name}</h3>
        <p className="text-spotify-light-gray text-xs">Playlist</p>
      </div>
    </Link>
  )
}

export default PlaylistCard
