import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { useAlbums } from '@/hooks/useAlbums'
import { useGenres } from '@/hooks/useGenres'

export function Genre() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { albums, loading } = useAlbums(slug)
  const { genres } = useGenres()
  const { t } = useTranslation()

  const genre = genres.find((g) => g.slug === slug)
  const filtered = albums.filter((a) => a.genre?.slug === slug)

  return (
    <>
      <Helmet>
        <title>{genre?.name ?? slug} — Blood Sad Shop</title>
        <meta property="og:title" content={`${genre?.name ?? slug} — Blood Sad Shop`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{genre?.name ?? slug}</h1>
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Cargando...</div>
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
