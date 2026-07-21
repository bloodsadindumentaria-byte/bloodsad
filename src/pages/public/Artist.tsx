import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArtistBio } from '@/components/artist/ArtistBio'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { LoadingState, NotFoundState } from '@/components/ui/loading'
import { useArtist } from '@/hooks/useArtists'
import { useAlbums } from '@/hooks/useAlbums'
import { useReels } from '@/hooks/useReels'
import { ReelsCarousel } from '@/components/reels/ReelsCarousel'
import { SITE_NAME } from '@/lib/constants'

export function Artist() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { artist, loading } = useArtist(slug)
  const { albums } = useAlbums()
  const { reels } = useReels({ artistId: artist?.id })
  const { t, i18n } = useTranslation()
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null)

  if (loading) return <LoadingState />
  if (!artist) return <NotFoundState message={t('common.not_found')} />

  const bio = i18n.language === 'en' ? artist.bio_en : artist.bio_es
  const artistAlbums = albums.filter((a) => a.artist_id === artist.id)
  const gallery = artist.gallery ?? []

  return (
    <>
      <Helmet>
        <title>{artist.name} — {SITE_NAME}</title>
        <meta name="description" content={bio?.slice(0, 160)} />
        <meta property="og:title" content={`${artist.name} — ${SITE_NAME}`} />
        <meta property="og:description" content={bio?.slice(0, 160)} />
        {artist.image_url && <meta property="og:image" content={artist.image_url} />}
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('breadcrumbs.artists'), to: '/artists' },
          { label: artist.name },
        ]} />

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <ArtistBio artist={artist} />
          </div>
          <div className="md:col-span-2 space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-4">{t('artist.discography')}</h2>
              {artistAlbums.length > 0 ? (
                <CatalogGrid albums={artistAlbums} />
              ) : (
                <p className="text-[#888888] text-sm">{t('artist.no_discography')}</p>
              )}
            </div>

            {gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">{t('artist.gallery')}</h2>
                {activeGalleryImg && (
                  <div className="w-full h-[420px] flex items-center justify-center bg-[#111111] rounded-sm border border-[#2a2a2a] mb-2 overflow-hidden">
                    <img
                      src={activeGalleryImg}
                      alt={artist.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveGalleryImg((prev) => (prev === src ? null : src))}
                      className={`aspect-square overflow-hidden rounded-sm border transition-colors duration-150 ${
                        activeGalleryImg === src ? 'border-[#6B5CE7]' : 'border-[#2a2a2a] hover:border-[#6B5CE7]'
                      }`}
                    >
                      <img src={src} alt={`${artist.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {reels.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">{t('reels.title')}</h2>
                <ReelsCarousel reels={reels} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
