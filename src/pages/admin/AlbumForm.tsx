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
import { ComboCreate } from '@/components/admin/ComboCreate'
import type { Album, AlbumCondition, AlbumImages, Currency, MediaItem } from '@/types'

function slugify(name: string) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

const CONDITIONS: AlbumCondition[] = ['mint', 'near_mint', 'very_good_plus', 'very_good', 'good', 'fair', 'poor']
const CURRENCIES: Currency[] = ['ARS', 'USD', 'EUR']

const EMPTY: Partial<Album> = {
  title: '', slug: '', year: new Date().getFullYear(), label: '',
  label_country: '', format: '',
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

function MediaPickerModal({
  multiple,
  albumTitle,
  onConfirm,
  onClose,
}: {
  multiple: boolean
  albumTitle: string
  onConfirm: (urls: string[]) => void
  onClose: () => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const all = (data as MediaItem[]) ?? []
        const title = albumTitle.toLowerCase().trim()
        const sorted = title
          ? [
              ...all.filter((i) => i.label?.toLowerCase().trim() === title),
              ...all.filter((i) => i.label?.toLowerCase().trim() !== title),
            ]
          : all
        setItems(sorted)
        setLoading(false)
      })
  }, [albumTitle])

  function toggle(url: string) {
    if (!multiple) {
      setSelected([url])
      return
    }
    setSelected((prev) =>
      prev.includes(url)
        ? prev.filter((u) => u !== url)
        : prev.length < 10
        ? [...prev, url]
        : prev
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-sm w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <span className="text-[#e0e0e0] font-semibold text-sm">
            Biblioteca de medios{multiple ? ' — hasta 10' : ' — elegir 1'}
          </span>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#e0e0e0] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3">
          {!loading && albumTitle && items.some((i) => i.label?.toLowerCase().trim() === albumTitle.toLowerCase().trim()) && (
            <p className="text-[#6B5CE7] text-xs mb-3 uppercase tracking-wider">
              ↑ Imágenes de "{albumTitle}" al inicio
            </p>
          )}
          {loading ? (
            <p className="text-[#888888] text-center py-8">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="text-[#888888] text-center py-8">
              No hay imágenes en la biblioteca todavía.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item.url)
                const isMatch = albumTitle
                  ? item.label?.toLowerCase().trim() === albumTitle.toLowerCase().trim()
                  : false
                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      onClick={() => toggle(item.url)}
                      className={`relative w-full aspect-square overflow-hidden rounded-sm border-2 transition-all duration-150 ${
                        isSelected
                          ? 'border-[#6B5CE7] shadow-[0_0_8px_rgba(107,92,231,0.5)]'
                          : isMatch
                          ? 'border-[#6B5CE7]/40 hover:border-[#6B5CE7]'
                          : 'border-[#2a2a2a] hover:border-[#6B5CE7]'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.label ?? item.filename}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[rgba(107,92,231,0.3)] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">✓</span>
                        </div>
                      )}
                    </button>
                    {item.label && (
                      <p className={`text-[10px] truncate text-center ${isMatch ? 'text-[#6B5CE7]' : 'text-[#555555]'}`}>
                        {item.label}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-[#2a2a2a]">
          <Button
            disabled={selected.length === 0}
            onClick={() => onConfirm(selected)}
          >
            Confirmar selección{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

function DropZone({
  label,
  preview,
  multiple = false,
  onFiles,
  onPickFromLibrary,
}: {
  label: string
  preview?: string | string[]
  multiple?: boolean
  onFiles: (files: FileList) => void
  onPickFromLibrary: () => void
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

      <button
        type="button"
        onClick={onPickFromLibrary}
        className="text-xs text-[#6B5CE7] hover:text-[#4a3eb5] transition-colors underline underline-offset-2"
      >
        Elegir de biblioteca →
      </button>

      {previews.length > 0 && (
        <div className={`grid gap-1 ${previews.length > 1 ? 'grid-cols-5' : 'grid-cols-1'}`}>
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
  const { artists: initialArtists } = useArtists()
  const { genres: initialGenres } = useGenres()
  const [localArtists, setLocalArtists] = useState<{ id: string; name: string }[]>([])
  const [localGenres, setLocalGenres] = useState<{ id: string; name: string }[]>([])

  const artists = localArtists.length ? localArtists : initialArtists.map((a) => ({ id: a.id, name: a.name }))
  const genres = localGenres.length ? localGenres : initialGenres.map((g) => ({ id: g.id, name: g.name }))

  const [form, setForm] = useState<Partial<Album>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])

  const [coverPreview, setCoverPreview] = useState<string>('')
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  const [pickerTarget, setPickerTarget] = useState<'cover' | 'gallery' | null>(null)

  useEffect(() => {
    if (initialArtists.length) setLocalArtists(initialArtists.map((a) => ({ id: a.id, name: a.name })))
  }, [initialArtists])
  useEffect(() => {
    if (initialGenres.length) setLocalGenres(initialGenres.map((g) => ({ id: g.id, name: g.name })))
  }, [initialGenres])

  async function createArtist(name: string): Promise<string> {
    const slug = slugify(name)
    const { data, error } = await supabase
      .from('artists')
      .insert({ name, slug, bio_es: '', bio_en: '', origin: '', genres: [], social_links: {} })
      .select('id')
      .single()
    if (error) throw error
    const newId = (data as { id: string }).id
    setLocalArtists((prev) => [...prev, { id: newId, name }])
    return newId
  }

  async function createGenre(name: string): Promise<string> {
    const slug = slugify(name)
    const { data, error } = await supabase
      .from('genres')
      .insert({ name, slug })
      .select('id')
      .single()
    if (error) throw error
    const newId = (data as { id: string }).id
    setLocalGenres((prev) => [...prev, { id: newId, name }])
    return newId
  }

  useEffect(() => {
    if (!isEdit) return
    supabase.from('albums').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data as Album)
    })
  }, [id, isEdit])

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
    const arr = Array.from(files).slice(0, 10)
    setGalleryFiles(arr)
    setGalleryPreviews(arr.map((f) => URL.createObjectURL(f)))
  }

  function handlePickFromLibrary(urls: string[]) {
    if (pickerTarget === 'cover') {
      setCoverFile(null)
      setCoverPreview(urls[0] ?? '')
      setForm((prev) => ({
        ...prev,
        images: { cover: urls[0] ?? '', gallery: (prev.images as AlbumImages)?.gallery ?? [] },
      }))
    } else if (pickerTarget === 'gallery') {
      setGalleryFiles([])
      setGalleryPreviews(urls)
      setForm((prev) => ({
        ...prev,
        images: { cover: (prev.images as AlbumImages)?.cover ?? '', gallery: urls },
      }))
    }
    setPickerTarget(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const slug = form.slug ?? 'album'
    let images: AlbumImages = (form.images as AlbumImages) ?? { cover: '', gallery: [] }

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
            <Input
              value={form.title ?? ''}
              onChange={(e) => {
                const title = e.target.value
                const slug = title
                  .normalize('NFD').replace(/[̀-ͯ]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .trim()
                  .replace(/\s+/g, '-')
                setForm((prev) => ({ ...prev, title, slug }))
              }}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} />
            <p className="text-[#555555] text-xs">Se genera automático. Editalo si hace falta.</p>
          </div>
        </div>

        {/* Artista + género */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ComboCreate
            label="Artista"
            options={artists}
            selectedId={form.artist_id ?? ''}
            onSelect={(id) => set('artist_id', id)}
            onCreate={createArtist}
          />
          <ComboCreate
            label="Género"
            options={genres}
            selectedId={form.genre_id ?? ''}
            onSelect={(id) => set('genre_id', id)}
            onCreate={createGenre}
          />
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

        {/* Sello + país + formato + condición */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Sello</Label>
            <Input value={form.label ?? ''} onChange={(e) => set('label', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>País del sello</Label>
            <Input
              value={form.label_country ?? ''}
              onChange={(e) => set('label_country', e.target.value)}
              placeholder="Ej: Argentina, Brasil, USA"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Formato</Label>
            <Input
              value={form.format ?? ''}
              onChange={(e) => set('format', e.target.value)}
              placeholder="Ej: CD, Digipak, CD+DVD, Box Set"
            />
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
            onPickFromLibrary={() => setPickerTarget('cover')}
          />

          <DropZone
            label="Galería (hasta 10 imágenes)"
            preview={galleryPreviews.length ? galleryPreviews : undefined}
            multiple
            onFiles={handleGalleryFiles}
            onPickFromLibrary={() => setPickerTarget('gallery')}
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

      {pickerTarget && (
        <MediaPickerModal
          multiple={pickerTarget === 'gallery'}
          albumTitle={form.title ?? ''}
          onConfirm={handlePickFromLibrary}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}