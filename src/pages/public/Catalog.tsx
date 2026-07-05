import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { LoadingState } from '@/components/ui/loading'
import { useAlbums } from '@/hooks/useAlbums'
import { useGenres } from '@/hooks/useGenres'
import { SITE_NAME } from '@/lib/constants'
import type { ProductType } from '@/types'

const TYPE_TABS: { value: ProductType | null; key: 'all_types' | 'title_music' | 'title_anime' }[] = [
  { value: null, key: 'all_types' },
  { value: 'music', key: 'title_music' },
  { value: 'anime_dvd', key: 'title_anime' },
]

export function Catalog() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { genres } = useGenres()
  const { albums, loading } = useAlbums()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const activeGenre = searchParams.get('genre') ?? null
  const activeType = (searchParams.get('type') as ProductType | null) ?? null
  const onlyAvailable = searchParams.get('available') === 'true'

  // Sincronizar query con URL con debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (query) next.set('q', query)
        else next.delete('q')
        return next
      }, { replace: true })
    }, 300)
    return () => clearTimeout(t)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  function setGenre(slug: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (slug) next.set('genre', slug)
      else next.delete('genre')
      return next
    }, { replace: true })
  }

  function setType(type: ProductType | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (type) next.set('type', type)
      else next.delete('type')
      next.delete('genre')
      return next
    }, { replace: true })
  }

  function toggleAvailable() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (onlyAvailable) next.delete('available')
      else next.set('available', 'true')
      return next
    }, { replace: true })
  }

  const byType = albums.filter((a) => !activeType || (a.product_type ?? 'music') === activeType)
  const relevantGenreSlugs = new Set(byType.flatMap((a) => a.genres ?? []).map((g) => g.slug))
  const visibleGenres = genres.filter((g) => relevantGenreSlugs.has(g.slug))

  const filtered = byType.filter((a) => {
    if (onlyAvailable && a.sold) return false
    if (activeGenre && !a.genres?.some((g) => g.slug === activeGenre)) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        (a.artist?.name ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const pageTitle = activeType === 'music' ? t('catalog.title_music')
    : activeType === 'anime_dvd' ? t('catalog.title_anime')
    : t('catalog.title')

  return (
    <>
      <Helmet>
        <title>{pageTitle} — {SITE_NAME}</title>
        <meta name="description" content="Explorá nuestro catálogo de discos de metal extremo y DVDs de anime." />
        <meta property="og:title" content={`${pageTitle} — ${SITE_NAME}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>

        {/* Pestañas de tipo de producto */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setType(tab.value)}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm border transition-colors ${
                activeType === tab.value
                  ? 'bg-[#6B5CE7] border-[#6B5CE7] text-white'
                  : 'border-[#2a2a2a] text-[#888888] hover:border-[#6B5CE7]'
              }`}
            >
              {t(`catalog.${tab.key}`)}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('catalog.search_placeholder')}
          className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-4 py-2.5 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors mb-4"
        />

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Toggle disponibles */}
          <button
            onClick={toggleAvailable}
            className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
              onlyAvailable
                ? 'bg-[#6B5CE7] border-[#6B5CE7] text-white'
                : 'border-[#2a2a2a] text-[#888888] hover:border-[#6B5CE7]'
            }`}
          >
            {t('catalog.only_available')}
          </button>

          {/* Separador visual */}
          <span className="border-l border-[#2a2a2a] mx-1" />

          {/* Todos los géneros */}
          <button
            onClick={() => setGenre(null)}
            className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
              !activeGenre
                ? 'bg-[#6B5CE7] border-[#6B5CE7] text-white'
                : 'border-[#2a2a2a] text-[#888888] hover:border-[#6B5CE7]'
            }`}
          >
            {t('catalog.all_genres')}
          </button>

          {/* Chips de géneros */}
          {visibleGenres.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenre(activeGenre === g.slug ? null : g.slug)}
              className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                activeGenre === g.slug
                  ? 'bg-[#6B5CE7] border-[#6B5CE7] text-white'
                  : 'border-[#2a2a2a] text-[#888888] hover:border-[#6B5CE7]'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading ? <LoadingState /> : <CatalogGrid albums={filtered} />}
      </div>
    </>
  )
}
