import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { useAlbum } from '@/hooks/useAlbums'
import { formatPrice, conditionLabel, buildWhatsAppLink, buildMailtoLink } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { AlbumImages } from '@/types'

const WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP as string
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string

export function Album() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { album, loading } = useAlbum(slug)
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'

  const [activeImg, setActiveImg] = useState<string>('')

  if (loading) return <div className="text-center py-24 text-[#888888]">Cargando...</div>
  if (!album) return <div className="text-center py-24 text-[#888888]">Álbum no encontrado.</div>

  const images = album.images as AlbumImages | null
  const cover = images?.cover ?? ''
  const gallery = images?.gallery ?? []
  const allImages = [cover, ...gallery].filter(Boolean)
  const displayImg = activeImg || cover

  const description = lang === 'en' ? album.description_en : album.description_es
  const artistBio = album.artist
    ? (lang === 'en' ? album.artist.bio_en : album.artist.bio_es)
    : null

  return (
    <>
      <Helmet>
        <title>{album.title} — Blood Sad Shop</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${album.title} — Blood Sad Shop`} />
        <meta property="og:description" content={description} />
        {cover && <meta property="og:image" content={cover} />}
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          to="/catalog"
          className="text-sm text-[#888888] hover:text-[#e0e0e0] transition-colors mb-6 inline-block"
        >
          {t('album.back')}
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Imágenes */}
          <div className="space-y-2">
            {displayImg ? (
              <img
                src={displayImg}
                alt={album.title}
                className="w-full aspect-square object-cover rounded-sm border border-[#2a2a2a]"
              />
            ) : (
              <div className="w-full aspect-square bg-[#111111] border border-[#2a2a2a] rounded-sm flex items-center justify-center text-[#2a2a2a] text-6xl">
                ◈
              </div>
            )}

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-1">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(src)}
                    className={`aspect-square overflow-hidden rounded-sm border transition-colors duration-150 ${
                      (activeImg || cover) === src
                        ? 'border-[#6B5CE7]'
                        : 'border-[#2a2a2a] hover:border-[#6B5CE7]'
                    }`}
                  >
                    <img src={src} alt={`${album.title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-[#e0e0e0]">{album.title}</h1>
              {album.artist && (
                <Link
                  to={`/artist/${album.artist.slug}`}
                  className="text-lg text-[#888888] hover:text-[#e0e0e0] transition-colors"
                >
                  {album.artist.name}
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('album.year')}: {album.year}</Badge>
              <Badge variant="secondary">{t('album.label')}: {album.label}</Badge>
              <Badge variant="outline">{conditionLabel(album.condition, lang)}</Badge>
              {album.genre && (
                <Link to={`/genre/${album.genre.slug}`}>
                  <Badge className="cursor-pointer">{album.genre.name}</Badge>
                </Link>
              )}
            </div>

            {description && (
              <p className="text-base leading-relaxed text-[#888888]">{description}</p>
            )}

            <div className="text-2xl font-black text-[#e0e0e0]">
              {formatPrice(album.price, album.currency)}
            </div>

            {album.sold ? (
              <div className="inline-block bg-[#6B5CE7] text-white text-sm font-semibold px-4 py-2 uppercase tracking-wider">
                {t('album.sold_out')}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {WHATSAPP && (
                  
                    href={buildWhatsAppLink(album.title, WHATSAPP)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-[#6B5CE7] hover:bg-[#4a3eb5] border-transparent text-white'
                    )}
                  >
                    {t('album.buy_whatsapp')}
                  </a>
                )}
                {EMAIL && (
                  
                    href={buildMailtoLink(album.title, EMAIL)}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'border-[#2a2a2a] text-[#888888] hover:border-[#6B5CE7] hover:text-[#6B5CE7]'
                    )}
                  >
                    {t('album.buy_email')}
                  </a>
                )}
              </div>
            )}

            {album.tracklist?.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2 text-[#e0e0e0]">{t('album.tracklist')}</h2>
                <ol className="space-y-1 text-sm text-[#888888]">
                  {album.tracklist.map((track, i) => (
                    <li key={i} className="flex justify-between gap-4 border-b border-[#1a1a1a] pb-1">
                      <span>{track.position}. {track.title}</span>
                      {track.duration && <span className="tabular-nums">{track.duration}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Bloque artista */}
            {album.artist && (
              <div className="border border-[#2a2a2a] rounded-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {album.artist.image_url && (
                    <img
                      src={album.artist.image_url}
                      alt={album.artist.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#2a2a2a] flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#555555]">
                      {lang === 'en' ? 'About the artist' : 'Sobre el artista'}
                    </p>
                    <p className="text-sm font-semibold text-[#e0e0e0]">{album.artist.name}</p>
                  </div>
                </div>

                {artistBio && (
                  <p className="text-sm text-[#888888] leading-relaxed line-clamp-3">
                    {artistBio}
                  </p>
                )}

                <Link
                  to={`/artist/${album.artist.slug}`}
                  className="text-xs text-[#6B5CE7] hover:text-[#4a3eb5] transition-colors inline-block"
                >
                  {lang === 'en' ? 'Read more' : 'Leer mas'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}