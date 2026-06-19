import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import type { Artist } from '@/types'

const EMPTY: Partial<Artist> = {
  name: '', slug: '', bio_es: '', bio_en: '', origin: '',
  genres: [], social_links: {}, image_url: '',
}

export function ArtistForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState<Partial<Artist>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    supabase.from('artists').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data as Artist)
    })
  }, [id, isEdit])

  function set<K extends keyof Artist>(key: K, value: Artist[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...form }
    if (!isEdit) delete payload.id

    const { error } = isEdit
      ? await supabase.from('artists').update(payload).eq('id', id!)
      : await supabase.from('artists').insert(payload)

    if (error) setError(error.message)
    else navigate('/admin/artists')
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('admin.edit') : t('admin.new')} Artista
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Origen</Label>
          <Input value={form.origin ?? ''} onChange={(e) => set('origin', e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Imagen (URL)</Label>
          <Input value={form.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Biografía (ES)</Label>
          <Textarea rows={4} value={form.bio_es ?? ''} onChange={(e) => set('bio_es', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Biografía (EN)</Label>
          <Textarea rows={4} value={form.bio_en ?? ''} onChange={(e) => set('bio_en', e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Géneros (separados por coma)</Label>
          <Input
            value={(form.genres ?? []).join(', ')}
            onChange={(e) => set('genres', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>

        <div className="space-y-2">
          <Label>Redes sociales</Label>
          {(['instagram', 'facebook', 'bandcamp', 'spotify', 'youtube', 'website'] as const).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-24 text-sm text-muted-foreground capitalize">{key}</span>
              <Input
                value={form.social_links?.[key] ?? ''}
                placeholder={`https://...`}
                onChange={(e) =>
                  set('social_links', { ...(form.social_links ?? {}), [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : t('admin.save')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/artists')}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
