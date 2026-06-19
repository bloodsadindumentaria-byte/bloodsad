import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import type { MediaItem } from '@/types'

async function uploadMediaFile(file: File): Promise<{ url: string; filename: string }> {
  const ext = file.name.split('.').pop()
  const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('albums').upload(path, file, { upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('albums').getPublicUrl(path)
  return { url: data.publicUrl, filename: file.name }
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function fetchItems() {
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((data as MediaItem[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  async function handleUpload(files: FileList) {
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const { url, filename } = await uploadMediaFile(file)
        await supabase.from('media').insert({ url, filename, label: null })
      }
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    }
    setUploading(false)
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`¿Eliminar "${item.filename}"?`)) return
    await supabase.from('media').delete().eq('id', item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  function startEdit(item: MediaItem) {
    setEditingId(item.id)
    setEditingLabel(item.label ?? '')
  }

  async function saveLabel(id: string) {
    await supabase.from('media').update({ label: editingLabel || null }).eq('id', id)
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, label: editingLabel || null } : i))
    )
    setEditingId(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#e0e0e0]">Biblioteca de medios</h1>
        <Link
          to="/admin"
          className="text-[#888888] hover:text-[#6B5CE7] text-sm transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Zona de upload */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#2a2a2a] hover:border-[#6B5CE7] rounded-sm p-8 text-center cursor-pointer transition-colors duration-200 mb-6"
      >
        <p className="text-[#888888] text-sm">
          {uploading ? 'Subiendo...' : 'Arrastrá imágenes acá o hacé click para seleccionar'}
        </p>
        <p className="text-[#444444] text-xs mt-1">Se aceptan múltiples archivos a la vez</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files) }}
        />
      </div>

      {error && <p className="text-sm text-[#c0392b] mb-4">{error}</p>}

      {loading ? (
        <p className="text-[#888888]">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-[#888888] text-center py-16">No hay imágenes todavía.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#111111] border border-[#2a2a2a] rounded-sm overflow-hidden hover:border-[#6B5CE7] transition-colors duration-200"
            >
              <div className="aspect-square overflow-hidden bg-[#1a1a1a]">
                <img
                  src={item.url}
                  alt={item.label ?? item.filename}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 space-y-1.5">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveLabel(item.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => saveLabel(item.id)}
                    className="w-full bg-[#0a0a0a] border border-[#6B5CE7] rounded-sm px-1.5 py-0.5 text-xs text-[#e0e0e0] outline-none"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(item)}
                    className="w-full text-left text-xs text-[#888888] hover:text-[#e0e0e0] truncate transition-colors"
                    title="Click para editar etiqueta"
                  >
                    {item.label ?? item.filename}
                  </button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full h-6 text-xs"
                  onClick={() => handleDelete(item)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
