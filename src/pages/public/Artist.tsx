import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArtistBio } from '@/components/artist/ArtistBio'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { useArtist } from '@/hooks/useArtists'
import { useAlbums } from '@/hooks/useAlbums'

export function Artist() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { artist, loading } = useArtist(slug)
  const { albums } = useAlbums()
  const { t, i18n } = useTranslation()

  if (loading) return <div className="text-center py-24 text-muted-foreground">Cargando...</div>
  if (!artist) return <div className="text-center py-24 text-muted-foreground">Artista no encontrado.</div>

  const bio = i18n.language === 'en' ? artist.bio_en : artist.bio_es
  const artistAlbums = albums.filter((a) => a.artist_id === artist.id)

  return (
    <>
      <Helmet>
        <title>{artist.name} — Blood Sad Shop</title>
        <meta name="description" content={bio?.slice(0, 160)} />
        <meta property="og:title" content={`${artist.name} — Blood Sad Shop`} />
        <meta property="og:description" content={bio?.slice(0, 160)} />
        {artist.image_url && <meta property="og:image" content={artist.image_url} />}
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <ArtistBio artist={artist} />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">{t('artist.discography')}</h2>
            <CatalogGrid albums={artistAlbums} />
          </div>
        </div>
      </div>
    </>
  )
}
