import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { LoadingState } from '@/components/ui/loading'
import { useAlbums } from '@/hooks/useAlbums'
import { useGenres } from '@/hooks/useGenres'
import { SITE_NAME } from '@/lib/constants'

export function Genre() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { albums, loading } = useAlbums()
  const { genres } = useGenres()
  const { t } = useTranslation()

  const genre = genres.find((g) => g.slug === slug)
  const filtered = albums.filter((a) => a.genres?.some((g) => g.slug === slug))

  return (
    <>
      <Helmet>
        <title>{genre?.name ?? slug} — {SITE_NAME}</title>
        <meta property="og:title" content={`${genre?.name ?? slug} — ${SITE_NAME}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('breadcrumbs.catalog'), to: '/catalog' },
          { label: genre?.name ?? slug },
        ]} />
        <h1 className="text-3xl font-bold mb-6">{genre?.name ?? slug}</h1>
        {loading ? (
          <LoadingState />
        ) : (
          <CatalogGrid albums={filtered} />
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-muted-foreground">{t('catalog.no_results')}</p>
        )}
      </div>
    </>
  )
}
