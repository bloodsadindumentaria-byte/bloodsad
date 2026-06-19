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

  const title = 'Blood Sad Shop — Discos de metal extremo y raridades'
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

      <section className="bg-[#0a0a0a] text-[#e0e0e0] py-24 px-4 text-center border-b border-[#2a2a2a]">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-[#e0e0e0]">
          {t('home.hero_title')}
        </h1>
        <p className="text-lg md:text-xl text-[#888888] mb-8 max-w-xl mx-auto">
          {t('home.hero_subtitle')}
        </p>
        <Link
          to="/catalog"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-[#6B5CE7] text-[#6B5CE7] hover:bg-[#6B5CE7] hover:text-white')}
        >
          {t('home.browse_catalog')}
        </Link>
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
