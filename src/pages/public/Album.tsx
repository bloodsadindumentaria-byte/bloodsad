import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { LoadingState, NotFoundState } from '@/components/ui/loading'
import { CountryFlag } from '@/components/ui/country-flag'
import { useAlbum } from '@/hooks/useAlbums'
import { useReels } from '@/hooks/useReels'
import { ReelsCarousel } from '@/components/reels/ReelsCarousel'
import { formatPrice, conditionLabel, buildWhatsAppLink, buildMailtoLink } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import type { AlbumImages } from '@/types'

const WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP as string
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string

export function Album() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { album, loading } = useAlbum(slug)
  const { reels } = useReels({ albumId: album?.id })
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'

  const [activeImg, setActiveImg] = useState<string>('')

  if (loading) return <LoadingState />
  if (!album) return <NotFoundState message={t('common.not_found')} />

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
        <title>{album.title} - {SITE_NAME}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${album.title} - ${SITE_NAME}`} />
        <meta property="og:description" content={description} />
        {cover && <meta property="og:image" content={cover} />}
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('breadcrumbs.catalog'), to: '/catalog' },
          { label: album.title },
        ]} />

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-2">
            {displayImg ? (
              <img
                src={displayImg}
                alt={album.title}
                className="w-full aspect-square object-cover rounded-sm border border-[#2a2a2a]"
              />
            ) : (
              <div className="w-full aspect-square bg-[#111111] border border-[#2a2a2a] rounded-sm flex items-center justify-center text-[#2a2a2a] text-6xl">
                O
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
                      {t('artist.about')}
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
                  {t('artist.read_more')} →
                </Link>
              </div>
            )}

            {reels.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm mb-2 text-[#e0e0e0] uppercase tracking-wider">{t('reels.title')}</h2>
                <ReelsCarousel reels={reels} />
              </div>
            )}
          </div>

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
              {album.label_country && (
                <Badge variant="secondary" title={album.label_country} className="gap-1.5">
                  <CountryFlag country={album.label_country} className="h-3 w-4 rounded-[1px] object-cover" />
                  {album.label_country}
                </Badge>
              )}
              <Badge variant="outline">{conditionLabel(album.condition, lang)}</Badge>
              {album.genres?.map((g) => (
                <Link key={g.id} to={`/genre/${g.slug}`}>
                  <Badge className="cursor-pointer">{g.name}</Badge>
                </Link>
              ))}
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
                  <a
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
                  <a
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

          </div>
        </div>
      </div>
    </>
  )
}


