import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArtistCard } from '@/components/artist/ArtistCard'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { LoadingState } from '@/components/ui/loading'
import { useArtists } from '@/hooks/useArtists'
import { SITE_NAME } from '@/lib/constants'

export function Artists() {
  const { t } = useTranslation()
  const { artists, loading } = useArtists()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? artists.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : artists

  return (
    <>
      <Helmet>
        <title>{t('artists.title')} — {SITE_NAME}</title>
        <meta name="description" content={t('artists.intro')} />
        <meta property="og:title" content={`${t('artists.title')} — ${SITE_NAME}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('artists.title') },
        ]} />

        <h1 className="text-3xl font-bold mb-3">{t('artists.title')}</h1>
        <p className="text-[#888888] text-sm max-w-2xl mb-6">{t('artists.intro')}</p>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('artists.search_placeholder')}
          className="w-full sm:max-w-sm bg-[#111111] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-4 py-2.5 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors mb-6"
        />

        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <p className="text-[#888888] text-center py-16">{t('artists.no_results')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
