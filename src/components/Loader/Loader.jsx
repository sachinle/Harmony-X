import React from 'react'
import { Music2 } from 'lucide-react'

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <Music2 className="text-spotify-green" size={36} />
        <span className="text-white text-2xl font-bold tracking-tight">Harmony X</span>
      </div>

      {/* Equalizer bars */}
      <div className="flex items-end gap-[5px] h-10">
        <div className="eq-bar eq-bar-1 w-[5px]" style={{ height: '40%' }} />
        <div className="eq-bar eq-bar-2 w-[5px]" style={{ height: '70%' }} />
        <div className="eq-bar eq-bar-3 w-[5px]" style={{ height: '55%' }} />
        <div className="eq-bar eq-bar-4 w-[5px]" style={{ height: '80%' }} />
        <div className="eq-bar eq-bar-1 w-[5px]" style={{ height: '45%' }} />
        <div className="eq-bar eq-bar-3 w-[5px]" style={{ height: '65%' }} />
        <div className="eq-bar eq-bar-2 w-[5px]" style={{ height: '35%' }} />
      </div>

      <p className="text-spotify-light-gray text-sm mt-8 tracking-widest uppercase">
        Loading
      </p>
    </div>
  )
}

export default Loader