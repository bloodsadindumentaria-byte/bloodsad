import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/components/ui/button'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { useAlbums } from '@/hooks/useAlbums'
import { cn } from '@/lib/utils'

export function Home() {
  const { t, i18n } = useTranslation()
  const { albums } = useAlbums()
  const lang = i18n.language

  const title = 'Roman Wrest Distro — Discos de metal extremo y raridades'
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
        <div className="relative z-10 text-center">
          <Link
            to="/catalog"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-[#6B5CE7] hover:bg-[#4a3eb5] border-transparent text-white text-lg px-10 py-4')}
          >
            {t('home.browse_catalog')}
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">{t('catalog.title')}</h2>
        <CatalogGrid albums={albums.slice(0, 10)} />
        <div className="text-center mt-8">
          <Link to="/catalog" className={buttonVariants({ variant: 'outline' })}>
            {t('home.browse_catalog')}
          </Link>
        </div>
      </section>
    </>
  )
}