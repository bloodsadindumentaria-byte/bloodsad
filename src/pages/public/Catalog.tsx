import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { GenreFilter } from '@/components/catalog/GenreFilter'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { useAlbums } from '@/hooks/useAlbums'
import { useGenres } from '@/hooks/useGenres'

export function Catalog() {
  const { t } = useTranslation()
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const { genres } = useGenres()
  const { albums, loading } = useAlbums(activeGenre)

  const filtered = activeGenre
    ? albums.filter((a) => a.genre?.slug === activeGenre)
    : albums

  return (
    <>
      <Helmet>
        <title>{t('catalog.title')} — Blood Sad Shop</title>
        <meta name="description" content="Explorá nuestro catálogo de discos de metal extremo." />
        <meta property="og:title" content={`${t('catalog.title')} — Blood Sad Shop`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('catalog.title')}</h1>

        <div className="mb-6">
          <GenreFilter genres={genres} activeSlug={activeGenre} onSelect={setActiveGenre} />
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Cargando...</div>
        ) : (
          <CatalogGrid albums={filtered} />
        )}
      </div>
    </>
  )
}
