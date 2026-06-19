import { useEffect, useRef, useState } from 'react'
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
import type { Album, AlbumCondition, AlbumImages, Currency } from '@/types'

const CONDITIONS: AlbumCondition[] = ['mint', 'near_mint', 'very_good_plus', 'very_good', 'good', 'fair', 'poor']
const CURRENCIES: Currency[] = ['ARS', 'USD', 'EUR']

const EMPTY: Partial<Album> = {
  title: '', slug: '', year: new Date().getFullYear(), label: '',
  description_es: '', description_en: '', condition: 'near_mint',
  price: 0, currency: 'ARS', sold: false, images: null, tracklist: [],
}

async function uploadImage(file: File, slug: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('albums').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('albums').getPublicUrl(path)
  return data.publicUrl
}

// Área de drop estilizada
function DropZone({
  label,
  preview,
  multiple = false,
  onFiles,
}: {
  label: string
  preview?: string | string[]
  multiple?: boolean
  onFiles: (files: FileList) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const previews = Array.isArray(preview) ? preview : preview ? [preview] : []

  return (
    <div className="space-y-2">
      <span className="block text-[#888888] text-xs uppercase tracking-wider">{label}</span>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files) }}
        onClick={() => ref.current?.click()}
        className={`
          border border-dashed rounded-sm p-4 text-center cursor-pointer
          transition-colors duration-200
          ${dragging ? 'border-[#6B5CE7] bg-[rgba(107,92,231,0.08)]' : 'border-[#2a2a2a] hover:border-[#6B5CE7]'}
        `}
      >
        <p className="text-[#888888] text-xs">
          {previews.length ? 'Cambiar imagen' : 'Arrastrá o hacé click para subir'}
        </p>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files) }}
        />
      </div>

      {previews.length > 0 && (
        <div className={`grid gap-1 ${previews.length > 1 ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`preview ${i + 1}`}
              className="aspect-square object-cover rounded-sm border border-[#2a2a2a]"
            />
          ))}
        </div>
      )}
    </div>
  )
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Archivos pendientes de subir
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])

  // Previews locales (object URLs)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  useEffect(() => {
    if (!isEdit) return
    supabase.from('albums').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data as Album)
    })
  }, [id, isEdit])

  // Carga previews desde imágenes existentes al editar
  useEffect(() => {
    const imgs = form.images as AlbumImages | null
    if (imgs && !coverFile) setCoverPreview(imgs.cover ?? '')
    if (imgs && !galleryFiles.length) setGalleryPreviews(imgs.gallery ?? [])
  }, [form.images]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof Album>(key: K, value: Album[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleCoverFiles(files: FileList) {
    const file = files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleGalleryFiles(files: FileList) {
    const arr = Array.from(files).slice(0, 4)
    setGalleryFiles(arr)
    setGalleryPreviews(arr.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const slug = form.slug ?? 'album'
    let images: AlbumImages = (form.images as AlbumImages) ?? { cover: '', gallery: [] }

    // Subir imágenes si hay archivos nuevos
    if (coverFile || galleryFiles.length) {
      setUploading(true)
      try {
        if (coverFile) {
          images = { ...images, cover: await uploadImage(coverFile, slug) }
        }
        if (galleryFiles.length) {
          const urls = await Promise.all(galleryFiles.map((f) => uploadImage(f, slug)))
          images = { ...images, gallery: urls }
        }
      } catch (err) {
        setError(`Error al subir imágenes: ${err instanceof Error ? err.message : 'desconocido'}`)
        setSaving(false)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    console.log('[AlbumForm] images a guardar:', JSON.stringify(images, null, 2))

    const payload = { ...form, images }
    if (!isEdit) delete payload.id

    const { error: dbError } = isEdit
      ? await supabase.from('albums').update(payload).eq('id', id!)
      : await supabase.from('albums').insert(payload)

    if (dbError) setError(dbError.message)
    else navigate('/admin/albums')
    setSaving(false)
  }

  const statusLabel = uploading ? 'Subiendo imágenes...' : saving ? 'Guardando...' : t('admin.save')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('admin.edit') : t('admin.new')} álbum
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Título + slug */}
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

        {/* Artista + género */}
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

        {/* Año + precio + moneda */}
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

        {/* Sello + condición */}
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

        {/* Descripciones */}
        <div className="space-y-1">
          <Label>Descripción (ES)</Label>
          <Textarea rows={3} value={form.description_es ?? ''} onChange={(e) => set('description_es', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Descripción (EN)</Label>
          <Textarea rows={3} value={form.description_en ?? ''} onChange={(e) => set('description_en', e.target.value)} />
        </div>

        {/* Imágenes */}
        <div className="border border-[#2a2a2a] rounded-sm p-4 space-y-4">
          <p className="text-[#888888] text-xs uppercase tracking-wider">Imágenes</p>

          <DropZone
            label="Portada"
            preview={coverPreview || undefined}
            onFiles={handleCoverFiles}
          />

          <DropZone
            label="Galería (hasta 4 imágenes)"
            preview={galleryPreviews.length ? galleryPreviews : undefined}
            multiple
            onFiles={handleGalleryFiles}
          />
        </div>

        {/* Vendido */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sold"
            checked={form.sold ?? false}
            onChange={(e) => set('sold', e.target.checked)}
            className="h-4 w-4 accent-[#6B5CE7]"
          />
          <Label htmlFor="sold">Vendido</Label>
        </div>

        {error && <p className="text-sm text-[#c0392b]">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving || uploading}>
            {statusLabel}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/albums')}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
