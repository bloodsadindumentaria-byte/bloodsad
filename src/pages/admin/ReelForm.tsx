import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchSelect } from '@/components/admin/SearchSelect'
import { supabase } from '@/lib/supabase'
import { useAlbums } from '@/hooks/useAlbums'
import { useArtists } from '@/hooks/useArtists'
import type { Reel } from '@/types'

const EMPTY: Partial<Reel> = {
  instagram_url: '', album_id: null, artist_id: null, views: null, likes: null, sort_order: 0,
}

export function ReelForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { albums } = useAlbums()
  const { artists } = useArtists()
  const [form, setForm] = useState<Partial<Reel>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const albumOptions = albums.map((a) => ({ id: a.id, name: a.title }))
  const artistOptions = artists.map((a) => ({ id: a.id, name: a.name }))

  useEffect(() => {
    if (!isEdit) return
    supabase.from('reels').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data as Reel)
    })
  }, [id, isEdit])

  function set<K extends keyof Reel>(key: K, value: Reel[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      album_id: form.album_id || null,
      artist_id: form.artist_id || null,
    }
    if (!isEdit) delete payload.id

    const { error } = isEdit
      ? await supabase.from('reels').update(payload).eq('id', id!)
      : await supabase.from('reels').insert(payload)

    if (error) setError(error.message)
    else navigate('/admin/reels')
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('admin.edit') : t('admin.new')} reel
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label>Link del reel de Instagram</Label>
          <Input
            value={form.instagram_url ?? ''}
            onChange={(e) => set('instagram_url', e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <SearchSelect
            label="Álbum / Anime"
            options={albumOptions}
            selectedId={form.album_id ?? ''}
            onSelect={(id) => set('album_id', id || null)}
          />
          <SearchSelect
            label="Artista"
            options={artistOptions}
            selectedId={form.artist_id ?? ''}
            onSelect={(id) => set('artist_id', id || null)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Vistas</Label>
            <Input
              type="number"
              value={form.views ?? ''}
              onChange={(e) => set('views', e.target.value ? Number(e.target.value) : null)}
              placeholder="Ej: 12400"
            />
          </div>
          <div className="space-y-1">
            <Label>Me gusta</Label>
            <Input
              type="number"
              value={form.likes ?? ''}
              onChange={(e) => set('likes', e.target.value ? Number(e.target.value) : null)}
              placeholder="Ej: 892"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Orden (menor primero)</Label>
          <Input
            type="number"
            value={form.sort_order ?? 0}
            onChange={(e) => set('sort_order', Number(e.target.value))}
          />
        </div>

        {error && <p className="text-sm text-[#c0392b]">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : t('admin.save')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/reels')}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
