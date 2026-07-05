import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/components/ui/button'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { ArtistCard } from '@/components/artist/ArtistCard'
import { useAlbums } from '@/hooks/useAlbums'
import { useArtists } from '@/hooks/useArtists'
import { useGenres } from '@/hooks/useGenres'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

export function Home() {
  const { t, i18n } = useTranslation()
  const { albums } = useAlbums()
  const { artists } = useArtists()
  const { genres } = useGenres()
  const lang = i18n.language

  const latestAlbums = [...albums]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const title = `${SITE_NAME} — Discos de metal extremo y raridades`
  const description =
    lang === 'en'
      ? 'Cult records, extreme metal and rarities. Buy online.'
      : 'Discos de culto, metal extremo y raridades. Comprá online.'

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Helmet>

      <section
        className="relative w-full h-[70vh] flex items-center justify-center"
        style={{ backgroundImage: 'url(/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <Link
            to="/catalog"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-[#6B5CE7] hover:bg-[#4a3eb5] border-transparent text-white text-lg px-10 py-4')}
          >
            {t('home.browse_catalog')}
          </Link>
        </div>
      </section>

      {/* Explorá por tipo */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-4">{t('home.explore_by_type')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/catalog?type=music"
            className="group border border-[#2a2a2a] hover:border-[#6B5CE7] rounded-sm p-6 transition-colors duration-200 flex items-center justify-between"
          >
            <span className="text-lg font-semibold text-[#e0e0e0] group-hover:text-[#6B5CE7] transition-colors">
              {t('home.type_music')}
            </span>
            <span className="text-[#555555] group-hover:text-[#6B5CE7] transition-colors">→</span>
          </Link>
          <Link
            to="/catalog?type=anime_dvd"
            className="group border border-[#2a2a2a] hover:border-[#6B5CE7] rounded-sm p-6 transition-colors duration-200 flex items-center justify-between"
          >
            <span className="text-lg font-semibold text-[#e0e0e0] group-hover:text-[#6B5CE7] transition-colors">
              {t('home.type_anime')}
            </span>
            <span className="text-[#555555] group-hover:text-[#6B5CE7] transition-colors">→</span>
          </Link>
        </div>
      </section>

      {/* Últimos ingresos */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6">{t('home.latest_arrivals')}</h2>
        <CatalogGrid albums={latestAlbums} />
        <div className="text-center mt-8">
          <Link to="/catalog" className={buttonVariants({ variant: 'outline' })}>
            {t('home.browse_catalog')}
          </Link>
        </div>
      </section>

      {/* Géneros */}
      {genres.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold mb-4">{t('home.browse_genres')}</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Link
                key={g.id}
                to={`/genre/${g.slug}`}
                className="px-3 py-1.5 text-xs rounded-sm border border-[#2a2a2a] text-[#888888] hover:border-[#6B5CE7] hover:text-[#e0e0e0] transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Artistas destacados */}
      {artists.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t('home.featured_artists')}</h2>
            <Link to="/artists" className="text-sm text-[#6B5CE7] hover:text-[#4a3eb5] transition-colors">
              {t('home.view_all_artists')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.slice(0, 6).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}