import { useTranslation } from 'react-i18next'
import { X, ExternalLink, Camera } from 'lucide-react'
import { toEmbedUrl } from '@/lib/instagram'
import type { Reel } from '@/types'

const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL as string

interface Props {
  reel: Reel
  onClose: () => void
}

export function ReelModal({ reel, onClose }: Props) {
  const { t } = useTranslation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-[#2a2a2a] rounded-sm w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-3 py-2 border-b border-[#2a2a2a]">
          <button onClick={onClose} className="text-[#888888] hover:text-[#e0e0e0] transition-colors" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <iframe
            src={toEmbedUrl(reel.instagram_url)}
            title="Instagram reel"
            className="w-full aspect-[9/16]"
            allow="autoplay; encrypted-media"
          />
        </div>

        <div className="flex flex-col gap-2 p-3 border-t border-[#2a2a2a]">
          <a
            href={reel.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#6B5CE7] hover:bg-[#4a3eb5] text-white text-sm font-semibold py-2.5 rounded-sm transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4" />
            {t('reels.view_on_instagram')}
          </a>
          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-[#2a2a2a] hover:border-[#6B5CE7] text-[#e0e0e0] hover:text-[#6B5CE7] text-sm font-semibold py-2.5 rounded-sm transition-colors duration-200"
            >
              <Camera className="h-4 w-4" />
              {t('reels.follow_on_instagram')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
