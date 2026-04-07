import React from 'react'

const SongCardSkeleton = () => {
  return (
    <div className="bg-spotify-dark p-4 rounded-md animate-pulse">
      <div className="w-full aspect-square bg-spotify-gray rounded-md mb-4"></div>
      <div className="h-4 bg-spotify-gray rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-spotify-gray rounded w-1/2"></div>
    </div>
  )
}

export default SongCardSkeleton