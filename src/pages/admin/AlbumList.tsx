import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAlbums } from '@/hooks/useAlbums'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export function AlbumList() {
  const { t } = useTranslation()
  const { albums, loading } = useAlbums()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este álbum?')) return
    setDeleting(id)
    await supabase.from('albums').delete().eq('id', id)
    setDeleting(null)
    window.location.reload()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.albums')}</h1>
        <Link to="/admin/albums/new" className={buttonVariants()}>
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
                <th className="text-left p-3 font-medium">Título</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Artista</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Año</th>
                <th className="text-left p-3 font-medium">Precio</th>
                <th className="text-left p-3 font-medium">Estado</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{album.title}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">
                    {album.artist?.name}
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{album.year}</td>
                  <td className="p-3">{formatPrice(album.price, album.currency)}</td>
                  <td className="p-3">
                    <Badge variant={album.sold ? 'secondary' : 'default'}>
                      {album.sold ? 'Vendido' : 'Disponible'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end items-center">
                      <a
                        href={`/album/${album.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#888888] hover:text-[#6B5CE7] text-xs transition-colors duration-200"
                      >
                        Ver
                      </a>
                      <Link
                        to={`/admin/albums/${album.id}/edit`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        {t('admin.edit')}
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleting === album.id}
                        onClick={() => handleDelete(album.id)}
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
