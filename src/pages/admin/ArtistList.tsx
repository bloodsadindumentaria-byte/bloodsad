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

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este artista?')) return
    setDeleting(id)
    await supabase.from('artists').delete().eq('id', id)
    setDeleting(null)
    window.location.reload()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.artists')}</h1>
        <Link to="/admin/artists/new" className={buttonVariants()}>
          {t('admin.new')}
        </Link>
      </div>

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
              {artists.map((artist) => (
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
