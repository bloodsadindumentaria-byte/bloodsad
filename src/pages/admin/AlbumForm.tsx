import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { useArtists } from '@/hooks/useArtists'
import { useGenres } from '@/hooks/useGenres'
import { ComboCreate } from '@/components/admin/ComboCreate'
import { GenreMultiSelect } from '@/components/admin/GenreMultiSelect'
import { DropZone } from '@/components/admin/DropZone'
import { MediaPickerModal } from '@/components/admin/MediaPickerModal'
import { PRODUCT_TYPES, PRODUCT_TYPE_META, COUNTRIES, countryFlag } from '@/lib/constants'
import type { Album, AlbumCondition, AlbumImages, Currency, ProductAttributes, ProductType } from '@/types'

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
  product_type: 'music', attributes: null,
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
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([])

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
    supabase.from('albums').select('*, album_genres(genre_id)').eq('id', id).single().then(({ data }) => {
      if (!data) return
      const { album_genres, ...rest } = data as Album & { album_genres: { genre_id: string }[] }
      setForm(rest)
      setSelectedGenreIds((album_genres ?? []).map((ag) => ag.genre_id))
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

  function setAttr<K extends keyof ProductAttributes>(key: K, value: ProductAttributes[K]) {
    setForm((prev) => ({ ...prev, attributes: { ...(prev.attributes ?? {}), [key]: value } }))
  }

  const isAnime = form.product_type === 'anime_dvd'

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

    const payload: Partial<Album> = { ...form, images }
    if (isAnime) payload.artist_id = null as unknown as string
    if (!isEdit) delete payload.id

    const { data: savedAlbum, error: dbError } = isEdit
      ? await supabase.from('albums').update(payload).eq('id', id!).select('id').single()
      : await supabase.from('albums').insert(payload).select('id').single()

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    const albumId = (savedAlbum as { id: string }).id
    await supabase.from('album_genres').delete().eq('album_id', albumId)
    if (selectedGenreIds.length) {
      const { error: genresError } = await supabase
        .from('album_genres')
        .insert(selectedGenreIds.map((genre_id) => ({ album_id: albumId, genre_id })))
      if (genresError) {
        setError(genresError.message)
        setSaving(false)
        return
      }
    }

    navigate('/admin/albums')
    setSaving(false)
  }

  const statusLabel = uploading ? 'Subiendo imágenes...' : saving ? 'Guardando...' : t('admin.save')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('admin.edit') : t('admin.new')} {PRODUCT_TYPE_META[form.product_type ?? 'music'].label.es.toLowerCase()}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo de producto */}
        <div className="space-y-1">
          <Label>Tipo de producto</Label>
          <Select
            value={form.product_type ?? 'music'}
            onValueChange={(v: string | null) => {
              if (!v) return
              const type = v as ProductType
              setForm((prev) => ({ ...prev, product_type: type, artist_id: type === 'anime_dvd' ? undefined : prev.artist_id }))
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((pt) => (
                <SelectItem key={pt} value={pt}>{PRODUCT_TYPE_META[pt].label.es}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        {/* Artista */}
        {!isAnime && (
          <ComboCreate
            label="Artista"
            options={artists}
            selectedId={form.artist_id ?? ''}
            onSelect={(id) => set('artist_id', id)}
            onCreate={createArtist}
          />
        )}

        {/* Géneros (múltiples) */}
        <GenreMultiSelect
          label="Géneros"
          options={genres}
          selectedIds={selectedGenreIds}
          onChange={setSelectedGenreIds}
          onCreate={createGenre}
        />

        {/* Campos específicos de anime */}
        {isAnime && (
          <div className="border border-[#2a2a2a] rounded-sm p-4 grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Estudio</Label>
              <Input
                value={form.attributes?.studio ?? ''}
                onChange={(e) => setAttr('studio', e.target.value)}
                placeholder="Ej: Madhouse, MAPPA"
              />
            </div>
            <div className="space-y-1">
              <Label>Episodios</Label>
              <Input
                type="number"
                value={form.attributes?.episodes ?? ''}
                onChange={(e) => setAttr('episodes', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-1">
              <Label>Audio</Label>
              <Input
                value={form.attributes?.audio ?? ''}
                onChange={(e) => setAttr('audio', e.target.value)}
                placeholder="Ej: Japonés, Español Latino"
              />
            </div>
            <div className="space-y-1">
              <Label>Subtítulos</Label>
              <Input
                value={form.attributes?.subtitles ?? ''}
                onChange={(e) => setAttr('subtitles', e.target.value)}
                placeholder="Ej: Español"
              />
            </div>
          </div>
        )}

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
            <Label>{isAnime ? 'País de origen' : 'País del sello'}</Label>
            <Select
              value={form.label_country || 'none'}
              onValueChange={(v: string | null) => set('label_country', !v || v === 'none' ? '' : v)}
            >
              <SelectTrigger><SelectValue placeholder="Sin especificar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.name}>{countryFlag(c.name)} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          titleHint={form.title ?? ''}
          onConfirm={handlePickFromLibrary}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}