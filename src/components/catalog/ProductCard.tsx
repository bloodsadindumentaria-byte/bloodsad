import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPrice, conditionLabel } from '@/lib/utils'
import type { Album } from '@/types'

interface Props {
  album: Album
}

const WHATSAPP = '5493576470083'

export function ProductCard({ album }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const cover = album.images?.cover ?? ''

  function handleBuy(e: React.MouseEvent) {
    e.preventDefault()
    const msg = encodeURIComponent(`Hola! Me interesa comprar: ${album.title} - ${album.artist?.name ?? ''}`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
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
              {album.artist?.name ?? ''}
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
              Comprar
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}