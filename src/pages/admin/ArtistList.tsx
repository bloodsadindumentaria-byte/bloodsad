import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, buttonVariants } from '@/components/ui/button'
import { useArtists } from '@/hooks/useArtists'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export function ArtistList() {
  const { t } = useTranslation()
  const { artists, loading } = useArtists()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? artists.filter((a) =>
        [a.name, a.origin ?? '', a.slug]
          .some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : artists

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este artista?')) return
    setDeleting(id)
    await supabase.from('artists').delete().eq('id', id)
    setDeleting(null)
    window.location.reload()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('admin.artists')}</h1>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-[#888888] hover:text-[#6B5CE7] text-sm transition-colors">
            ← Dashboard
          </Link>
          <Link to="/admin/artists/new" className={buttonVariants()}>
            {t('admin.new')}
          </Link>
        </div>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre, origen o slug..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors mb-4"
      />

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Origen</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Slug</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[#888888] text-sm">
                    Sin resultados para "{query}"
                  </td>
                </tr>
              )}
              {filtered.map((artist) => (
                <tr key={artist.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{artist.name}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{artist.origin}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{artist.slug}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/admin/artists/${artist.id}/edit`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        {t('admin.edit')}
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleting === artist.id}
                        onClick={() => handleDelete(artist.id)}
                      >
                        {t('admin.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
