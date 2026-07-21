import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, buttonVariants } from '@/components/ui/button'
import { useReels } from '@/hooks/useReels'
import { supabase } from '@/lib/supabase'

export function ReelList() {
  const { t } = useTranslation()
  const { reels, loading } = useReels()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este video?')) return
    setDeleting(id)
    await supabase.from('reels').delete().eq('id', id)
    setDeleting(null)
    window.location.reload()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Videos</h1>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-[#888888] hover:text-[#6B5CE7] text-sm transition-colors">
            ← Dashboard
          </Link>
          <Link to="/admin/reels/new" className={buttonVariants()}>
            {t('admin.new')}
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Video</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Álbum</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Artista</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Vistas / Me gusta</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {reels.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#888888] text-sm">
                    Todavía no hay videos cargados.
                  </td>
                </tr>
              )}
              {reels.map((reel) => (
                <tr key={reel.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">
                    <a href={reel.video_url} target="_blank" rel="noopener noreferrer" className="text-[#6B5CE7] hover:underline">
                      Ver video →
                    </a>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{reel.album?.title ?? '—'}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{reel.artist?.name ?? '—'}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">
                    {reel.views ?? '—'} / {reel.likes ?? '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/admin/reels/${reel.id}/edit`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        {t('admin.edit')}
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleting === reel.id}
                        onClick={() => handleDelete(reel.id)}
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
