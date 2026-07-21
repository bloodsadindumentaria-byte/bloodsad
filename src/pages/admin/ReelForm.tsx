import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchSelect } from '@/components/admin/SearchSelect'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { useAlbums } from '@/hooks/useAlbums'
import { useArtists } from '@/hooks/useArtists'
import type { Reel } from '@/types'

const EMPTY: Partial<Reel> = {
  video_url: '', album_id: null, artist_id: null, views: null, likes: null, sort_order: 0,
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const albumOptions = albums.map((a) => ({ id: a.id, name: a.title }))
  const artistOptions = artists.map((a) => ({ id: a.id, name: a.name }))

  useEffect(() => {
    if (!isEdit) return
    supabase.from('reels').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      const loaded = data as Reel
      setForm(loaded)
      setVideoPreview(loaded.video_url ?? '')
    })
  }, [id, isEdit])

  function set<K extends keyof Reel>(key: K, value: Reel[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!videoFile && !form.video_url) {
      setError('Subí un video antes de guardar.')
      return
    }

    setSaving(true)
    let videoUrl = form.video_url ?? ''

    if (videoFile) {
      setUploading(true)
      try {
        videoUrl = await uploadImage(videoFile, 'reels')
      } catch (err) {
        setError(`Error al subir el video: ${err instanceof Error ? err.message : 'desconocido'}`)
        setSaving(false)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const payload = {
      ...form,
      video_url: videoUrl,
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

  const statusLabel = uploading ? 'Subiendo video...' : saving ? 'Guardando...' : t('admin.save')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('admin.edit') : t('admin.new')} video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <span className="block text-[#888888] text-xs uppercase tracking-wider">Video</span>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
            onClick={() => fileRef.current?.click()}
            className={`
              border border-dashed rounded-sm p-4 text-center cursor-pointer
              transition-colors duration-200
              ${dragging ? 'border-[#6B5CE7] bg-[rgba(107,92,231,0.08)]' : 'border-[#2a2a2a] hover:border-[#6B5CE7]'}
            `}
          >
            <p className="text-[#888888] text-xs">
              {videoPreview ? 'Cambiar video' : 'Arrastrá o hacé click para subir un video'}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {videoPreview && (
            <video
              src={videoPreview}
              controls
              muted
              className="w-full max-h-80 rounded-sm border border-[#2a2a2a] bg-black"
            />
          )}
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
          <Button type="submit" disabled={saving || uploading}>
            {statusLabel}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/reels')}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
