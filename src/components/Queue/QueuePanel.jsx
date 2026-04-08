import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, GripVertical, Trash2, ListMusic } from 'lucide-react'
import { removeFromQueue, clearQueue, setShowQueue } from '../../store/slices/playerSlice'
import PlayingAnimation from '../Player/PlayingAnimation'
import { formatDuration } from '../../utils/formatters'

const QueuePanel = () => {
  const dispatch = useDispatch()
  const { currentSong, queue, isPlaying, currentPlaylist, currentIndex, showQueue } = useSelector((s) => s.player)

  // Remaining playlist songs (after current)
  const upNext = currentPlaylist.slice(currentIndex + 1)

  if (!showQueue) return null

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => dispatch(setShowQueue(false))}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-[90px] w-full md:w-[340px] bg-[#121212] border-l border-white/10 z-50 flex flex-col animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-bold text-lg">Queue</h2>
          <button
            onClick={() => dispatch(setShowQueue(false))}
            className="text-spotify-light-gray hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Now Playing */}
          {currentSong && (
            <div className="px-6 py-4">
              <p className="text-spotify-light-gray text-xs uppercase tracking-wider font-bold mb-3">Now playing</p>
              <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <img
                  src={currentSong.cover_url || 'https://picsum.photos/40/40'}
                  alt={currentSong.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-spotify-green text-sm font-medium truncate">{currentSong.title}</p>
                  <p className="text-spotify-light-gray text-xs truncate">{currentSong.artist}</p>
                </div>
                <PlayingAnimation isPlaying={isPlaying} size="sm" />
              </div>
            </div>
          )}

          {/* Queue */}
          {queue.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-spotify-light-gray text-xs uppercase tracking-wider font-bold">Next in queue</p>
                <button
                  onClick={() => dispatch(clearQueue())}
                  className="text-spotify-light-gray hover:text-white text-xs transition"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {queue.map((song, i) => (
                  <div
                    key={`${song.id}-${i}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 group transition"
                  >
                    <GripVertical size={14} className="text-white/30 flex-shrink-0 cursor-grab" />
                    <img
                      src={song.cover_url || 'https://picsum.photos/40/40'}
                      alt={song.title}
                      className="w-9 h-9 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm truncate">{song.title}</p>
                      <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
                    </div>
                    <span className="text-spotify-light-gray text-xs flex-shrink-0">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => dispatch(removeFromQueue(i))}
                      className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-red-400 transition flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next from playlist */}
          {upNext.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-spotify-light-gray text-xs uppercase tracking-wider font-bold mb-3">Next from playlist</p>
              <div className="space-y-1">
                {upNext.slice(0, 10).map((song, i) => (
                  <div key={`${song.id}-up-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 group transition">
                    <img
                      src={song.cover_url || 'https://picsum.photos/40/40'}
                      alt={song.title}
                      className="w-9 h-9 rounded object-cover flex-shrink-0 opacity-60"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-white/60 text-sm truncate">{song.title}</p>
                      <p className="text-spotify-light-gray/60 text-xs truncate">{song.artist}</p>
                    </div>
                    <span className="text-spotify-light-gray/60 text-xs flex-shrink-0">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                ))}
                {upNext.length > 10 && (
                  <p className="text-spotify-light-gray text-xs px-2 pt-1">+{upNext.length - 10} more</p>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {queue.length === 0 && upNext.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
              <ListMusic size={40} className="text-white/20 mb-3" />
              <p className="text-white/60 text-sm">Your queue is empty</p>
              <p className="text-white/30 text-xs mt-1">Add songs using the context menu</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default QueuePanel
