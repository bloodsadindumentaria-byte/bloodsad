import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { useAlbums } from '@/hooks/useAlbums'
import { useGenres } from '@/hooks/useGenres'

export function Catalog() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { genres } = useGenres()
  const { albums, loading } = useAlbums()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const activeGenre = searchParams.get('genre') ?? null
  const onlyAvailable = searchParams.get('available') !== 'false'

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

  function toggleAvailable() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (onlyAvailable) next.set('available', 'false')
      else next.delete('available')
      return next
    }, { replace: true })
  }

  const filtered = albums.filter((a) => {
    if (onlyAvailable && a.sold) return false
    if (activeGenre && a.genre?.slug !== activeGenre) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        (a.artist?.name ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <>
      <Helmet>
        <title>{t('catalog.title')} — Blood Sad Shop</title>
        <meta name="description" content="Explorá nuestro catálogo de discos de metal extremo." />
        <meta property="og:title" content={`${t('catalog.title')} — Blood Sad Shop`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('catalog.title')}</h1>

        {/* Buscador */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título o artista..."
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
            Solo disponibles
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
          {genres.map((g) => (
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

        {loading ? (
          <div className="text-center py-16 text-[#888888]">Cargando...</div>
        ) : (
          <CatalogGrid albums={filtered} />
        )}
      </div>
    </>
  )
}
