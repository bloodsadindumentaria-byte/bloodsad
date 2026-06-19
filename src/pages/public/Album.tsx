import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { useAlbum } from '@/hooks/useAlbums'
import { formatPrice, conditionLabel, buildWhatsAppLink, buildMailtoLink } from '@/lib/utils'
import { cn } from '@/lib/utils'

const WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP as string
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string

export function Album() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { album, loading } = useAlbum(slug)
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'

  if (loading) return <div className="text-center py-24 text-muted-foreground">Cargando...</div>
  if (!album) return <div className="text-center py-24 text-muted-foreground">Álbum no encontrado.</div>

  const description = lang === 'en' ? album.description_en : album.description_es
  const ogImage = album.images?.[0] ?? ''

  return (
    <>
      <Helmet>
        <title>{album.title} — Blood Sad Shop</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${album.title} — Blood Sad Shop`} />
        <meta property="og:description" content={description} />
        {ogImage && <meta property="og:image" content={ogImage} />}
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← {t('album.back')}
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-2">
            {album.images?.length > 0 ? (
              <>
                <img
                  src={album.images[0]}
                  alt={album.title}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                {album.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1">
                    {album.images.slice(1).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${album.title} ${i + 2}`}
                        className="aspect-square object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-6xl">
                🎵
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{album.title}</h1>
              {album.artist && (
                <Link
                  to={`/artist/${album.artist.slug}`}
                  className="text-lg text-muted-foreground hover:text-foreground"
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
              <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
            )}

            <div className="text-2xl font-black">
              {formatPrice(album.price, album.currency)}
            </div>

            {album.sold ? (
              <Badge variant="destructive" className="text-base px-4 py-2">
                {t('album.sold_out')}
              </Badge>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {WHATSAPP && (
                  <a
                    href={buildWhatsAppLink(album.title, WHATSAPP)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: 'lg' }))}
                  >
                    {t('album.buy_whatsapp')}
                  </a>
                )}
                {EMAIL && (
                  <a
                    href={buildMailtoLink(album.title, EMAIL)}
                    className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
                  >
                    {t('album.buy_email')}
                  </a>
                )}
              </div>
            )}

            {album.tracklist?.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2">{t('album.tracklist')}</h2>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  {album.tracklist.map((track, i) => (
                    <li key={i} className="flex justify-between gap-4">
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
