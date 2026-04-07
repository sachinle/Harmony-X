import React from 'react'
import { Link } from 'react-router-dom'

const PlaylistCard = ({ playlist }) => {
  return (
    <Link to={`/playlist/${playlist.id}`}>
      <div className="bg-spotify-dark p-4 rounded-md hover:bg-spotify-gray transition-all duration-200 cursor-pointer group">
        <div className="w-full aspect-square bg-gradient-to-br from-spotify-green/50 to-spotify-gray rounded-md mb-4 flex items-center justify-center">
          <svg className="w-16 h-16 text-white/70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
          </svg>
        </div>
        <h3 className="text-white font-medium truncate">{playlist.name}</h3>
        <p className="text-spotify-light-gray text-sm">Playlist</p>
      </div>
    </Link>
  )
}

export default PlaylistCard