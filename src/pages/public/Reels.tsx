import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ReelCard } from '@/components/reels/ReelCard'
import { ReelModal } from '@/components/reels/ReelModal'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { LoadingState } from '@/components/ui/loading'
import { useReels } from '@/hooks/useReels'
import { SITE_NAME } from '@/lib/constants'
import type { Reel } from '@/types'

export function Reels() {
  const { t } = useTranslation()
  const { reels, loading } = useReels()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Reel | null>(null)

  const filtered = query.trim()
    ? reels.filter((r) => {
        const q = query.toLowerCase()
        return (r.artist?.name ?? '').toLowerCase().includes(q) || (r.album?.title ?? '').toLowerCase().includes(q)
      })
    : reels

  return (
    <>
      <Helmet>
        <title>{t('reels.page_title')} — {SITE_NAME}</title>
        <meta name="description" content={t('reels.page_intro')} />
        <meta property="og:title" content={`${t('reels.page_title')} — ${SITE_NAME}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('reels.page_title') },
        ]} />

        <h1 className="text-3xl font-bold mb-3">{t('reels.page_title')}</h1>
        <p className="text-[#888888] text-sm max-w-2xl mb-6">{t('reels.page_intro')}</p>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('reels.search_placeholder')}
          className="w-full sm:max-w-sm bg-[#111111] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-4 py-2.5 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors mb-6"
        />

        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <p className="text-[#888888] text-center py-16">{t('reels.no_results')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((reel) => (
              <div key={reel.id} className="space-y-1.5">
                <ReelCard reel={reel} onOpen={setActive} variant="grid" />
                <p className="text-[10px] text-[#888888] truncate">
                  {reel.artist || reel.album ? (
                    <>
                      {reel.artist && (
                        <Link to={`/artist/${reel.artist.slug}`} className="hover:text-[#6B5CE7] transition-colors">
                          {reel.artist.name}
                        </Link>
                      )}
                      {reel.artist && reel.album && <span className="mx-1">·</span>}
                      {reel.album && (
                        <Link to={`/album/${reel.album.slug}`} className="hover:text-[#6B5CE7] transition-colors">
                          {reel.album.title}
                        </Link>
                      )}
                    </>
                  ) : (
                    <span className="text-[#555555]">{t('reels.unlinked')}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && <ReelModal reel={active} onClose={() => setActive(null)} />}
    </>
  )
}
