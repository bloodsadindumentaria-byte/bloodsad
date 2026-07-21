import { Eye, Heart, Play } from 'lucide-react'
import { toEmbedUrl, formatCount } from '@/lib/instagram'
import { cn } from '@/lib/utils'
import type { Reel } from '@/types'

interface Props {
  reel: Reel
  onOpen: (reel: Reel) => void
  variant?: 'carousel' | 'grid'
}

export function ReelCard({ reel, onOpen, variant = 'carousel' }: Props) {
  return (
    <div
      className={cn(
        'relative aspect-[9/16] snap-start rounded-sm overflow-hidden border border-[#2a2a2a] bg-[#111111]',
        variant === 'carousel' ? 'flex-none w-[180px] sm:w-[220px]' : 'w-full'
      )}
    >
      <iframe
        src={toEmbedUrl(reel.instagram_url)}
        title="Instagram reel"
        className="absolute inset-0 w-full h-full pointer-events-none"
        allow="autoplay; encrypted-media"
        loading="lazy"
        scrolling="no"
      />

      <button
        onClick={() => onOpen(reel)}
        className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors duration-200 group"
        aria-label="Ver reel"
      >
        <span className="flex items-center justify-center h-11 w-11 rounded-full bg-black/60 text-white group-hover:scale-110 transition-transform duration-200">
          <Play className="h-5 w-5 fill-current" />
        </span>

        {(reel.views != null || reel.likes != null) && (
          <span className="absolute bottom-2 left-2 right-2 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-sm px-2 py-1 text-[11px] text-white">
            {reel.views != null && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {formatCount(reel.views)}
              </span>
            )}
            {reel.likes != null && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {formatCount(reel.likes)}
              </span>
            )}
          </span>
        )}
      </button>
    </div>
  )
}
