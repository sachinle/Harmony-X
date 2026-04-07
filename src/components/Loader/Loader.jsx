import React from 'react'

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-spotify-black/80 flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default Loader