import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useArtists } from '@/hooks/useArtists'
import { useGenres } from '@/hooks/useGenres'
import type { Album, AlbumCondition, Currency } from '@/types'

const CONDITIONS: AlbumCondition[] = ['mint', 'near_mint', 'very_good_plus', 'very_good', 'good', 'fair', 'poor']
const CURRENCIES: Currency[] = ['ARS', 'USD', 'EUR']

const EMPTY: Partial<Album> = {
  title: '', slug: '', year: new Date().getFullYear(), label: '',
  description_es: '', description_en: '', condition: 'near_mint',
  price: 0, currency: 'ARS', sold: false, images: [], tracklist: [],
}

export function AlbumForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { artists } = useArtists()
  const { genres } = useGenres()
  const [form, setForm] = useState<Partial<Album>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    supabase.from('albums').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data as Album)
    })
  }, [id, isEdit])

  function set<K extends keyof Album>(key: K, value: Album[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = { ...form }
    if (!isEdit) delete payload.id

    const { error } = isEdit
      ? await supabase.from('albums').update(payload).eq('id', id!)
      : await supabase.from('albums').insert(payload)

    if (error) setError(error.message)
    else navigate('/admin/albums')
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('admin.edit') : t('admin.new')} {t('admin.albums').slice(0, -1)}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Título</Label>
            <Input value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} required />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Artista</Label>
            <Select value={form.artist_id ?? ''} onValueChange={(v: string | null) => set('artist_id', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {artists.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Género</Label>
            <Select value={form.genre_id ?? ''} onValueChange={(v: string | null) => set('genre_id', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Año</Label>
            <Input type="number" value={form.year ?? ''} onChange={(e) => set('year', Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label>Precio</Label>
            <Input type="number" value={form.price ?? ''} onChange={(e) => set('price', Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label>Moneda</Label>
            <Select value={form.currency ?? 'ARS'} onValueChange={(v: string | null) => { if (v) set('currency', v as Currency) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Sello</Label>
            <Input value={form.label ?? ''} onChange={(e) => set('label', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Condición</Label>
            <Select value={form.condition ?? 'near_mint'} onValueChange={(v: string | null) => { if (v) set('condition', v as AlbumCondition) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Descripción (ES)</Label>
          <Textarea rows={3} value={form.description_es ?? ''} onChange={(e) => set('description_es', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Descripción (EN)</Label>
          <Textarea rows={3} value={form.description_en ?? ''} onChange={(e) => set('description_en', e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Imágenes (URLs separadas por coma)</Label>
          <Input
            value={(form.images ?? []).join(', ')}
            onChange={(e) => set('images', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sold"
            checked={form.sold ?? false}
            onChange={(e) => set('sold', e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="sold">Vendido</Label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : t('admin.save')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/albums')}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
