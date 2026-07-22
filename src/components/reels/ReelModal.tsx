import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { Reel } from '@/types'

interface Props {
  reel: Reel
  onClose: () => void
}

export function ReelModal({ reel, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-[#2a2a2a] rounded-sm w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#2a2a2a] flex-shrink-0">
          {(reel.artist || reel.album) ? (
            <p className="text-xs text-[#888888] truncate">
              {reel.artist && (
                <Link to={`/artist/${reel.artist.slug}`} onClick={onClose} className="hover:text-[#6B5CE7] transition-colors">
                  {reel.artist.name}
                </Link>
              )}
              {reel.artist && reel.album && <span className="mx-1.5">·</span>}
              {reel.album && (
                <Link to={`/album/${reel.album.slug}`} onClick={onClose} className="hover:text-[#6B5CE7] transition-colors">
                  {reel.album.title}
                </Link>
              )}
            </p>
          ) : <span />}
          <button onClick={onClose} className="text-[#888888] hover:text-[#e0e0e0] transition-colors flex-shrink-0" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
          <video
            src={reel.video_url}
            className="max-w-full max-h-[80vh] w-auto h-auto"
            controls
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  )
}
