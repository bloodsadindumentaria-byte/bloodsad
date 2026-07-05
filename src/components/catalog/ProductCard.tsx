import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Disc3, Clapperboard } from 'lucide-react'
import { formatPrice, conditionLabel, buildWhatsAppLink } from '@/lib/utils'
import { countryFlag } from '@/lib/constants'
import type { Album } from '@/types'

interface Props {
  album: Album
}

const WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP as string

export function ProductCard({ album }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const cover = album.images?.cover ?? ''
  const isAnime = album.product_type === 'anime_dvd'
  const flag = countryFlag(album.label_country)

  function handleBuy(e: React.MouseEvent) {
    e.preventDefault()
    if (!WHATSAPP) return
    window.open(buildWhatsAppLink(`${album.title}${album.artist?.name ? ' - ' + album.artist.name : ''}`, WHATSAPP), '_blank')
  }

  return (
    <Link to={`/album/${album.slug}`} className="group block">
      <div
        className="
          bg-[#111111] border border-[#2a2a2a] rounded-sm overflow-hidden
          hover:border-[#6B5CE7] hover:shadow-[0_0_12px_rgba(107,92,231,0.2)]
          transition-all duration-200
        "
      >
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
          {cover ? (
            <img
              src={cover}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#888888] text-4xl">
              ◈
            </div>
          )}

          <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-sm p-1 text-[#e0e0e0]">
            {isAnime ? <Clapperboard className="h-3.5 w-3.5" /> : <Disc3 className="h-3.5 w-3.5" />}
            {flag && <span title={album.label_country ?? ''} className="text-xs leading-none">{flag}</span>}
          </span>

          {album.sold && (
            <span className="absolute top-2 right-2 bg-[#6B5CE7] text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
              {t('catalog.sold_out')}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <div>
            <p className="text-[#888888] text-[10px] uppercase tracking-wider mb-0.5 truncate">
              {album.artist?.name ?? (isAnime ? album.attributes?.studio ?? '' : '')}
            </p>
            <p className="text-[#e0e0e0] text-sm font-medium leading-tight truncate">
              {album.title}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[#6B5CE7] text-sm font-semibold">
                {formatPrice(album.price, album.currency)}
              </span>
              <span className="text-[#888888] text-[10px] uppercase tracking-wider">
                {conditionLabel(album.condition, lang)}
              </span>
            </div>
          </div>

          {!album.sold && (
            <button
              onClick={handleBuy}
              className="w-full bg-[#6B5CE7] hover:bg-[#4a3eb5] text-white text-xs font-semibold py-2 transition-colors duration-200 uppercase tracking-wider"
            >
              {t('album.buy')}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}