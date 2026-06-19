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

async function identifyAlbum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  const imageBase64 = btoa(binary)
  const mediaType = file.type || 'image/jpeg'

  const { data, error } = await supabase.functions.invoke('dynamic-action', {
    body: { imageBase64, mediaType },
  })
  if (error) throw error
  return (data as { name: string }).name ?? '?'
}

// Modal para confirmar / editar nombre detectado por IA
function CdNameModal({
  files,
  onConfirm,
  onCancel,
}: {
  files: FileList
  onConfirm: (cdName: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    identifyAlbum(files[0])
      .then((detected) => setName(detected === '?' ? '' : detected))
      .catch(() => setName(''))
      .finally(() => setDetecting(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-sm w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-[#e0e0e0] font-semibold">¿A qué CD pertenecen estas imágenes?</h2>

        {detecting ? (
          <p className="text-[#6B5CE7] text-xs animate-pulse">Identificando álbum con IA...</p>
        ) : name && name !== '?' ? (
          <p className="text-[#888888] text-xs">
            IA detectó: <span className="text-[#6B5CE7]">{name}</span> — confirmá o editá abajo.
          </p>
        ) : (
          <p className="text-[#888888] text-xs">
            No se pudo identificar automáticamente. Escribí el nombre del CD.
          </p>
        )}

        <input
          autoFocus={!detecting}
          placeholder="Nombre del CD (ej: Reign in Blood)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim()) }}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] outline-none transition-colors disabled:opacity-40"
          disabled={detecting}
        />

        <p className="text-[#444444] text-xs">
          {files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}
        </p>

        <div className="flex gap-2">
          <Button
            disabled={detecting || !name.trim()}
            onClick={() => onConfirm(name.trim())}
            className="flex-1"
          >
            Subir imágenes
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null)
  const [query, setQuery] = useState('')
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

  function handleFilesSelected(files: FileList) {
    if (!files.length) return
    setPendingFiles(files)
  }

  async function handleUpload(files: FileList, cdName: string) {
    setPendingFiles(null)
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const { url, filename } = await uploadMediaFile(file)
        await supabase.from('media').insert({ url, filename, label: cdName })
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

  const visibleItems = query.trim()
    ? items.filter((i) =>
        [i.label ?? '', i.filename]
          .some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : items

  // Agrupar por CD para mostrar encabezados
  const grouped = visibleItems.reduce<Record<string, MediaItem[]>>((acc, item) => {
    const key = item.label ?? '(sin CD)'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

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
          if (e.dataTransfer.files.length) handleFilesSelected(e.dataTransfer.files)
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
          onChange={(e) => { if (e.target.files?.length) handleFilesSelected(e.target.files) }}
        />
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre de CD o archivo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors mb-4"
      />

      {error && <p className="text-sm text-[#c0392b] mb-4">{error}</p>}

      {loading ? (
        <p className="text-[#888888]">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-[#888888] text-center py-16">No hay imágenes todavía.</p>
      ) : visibleItems.length === 0 ? (
        <p className="text-[#888888] text-center py-16">Sin resultados para "{query}"</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cd, cdItems]) => (
            <div key={cd}>
              <p className="text-[#6B5CE7] text-xs uppercase tracking-widest font-semibold mb-3">
                {cd}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cdItems.map((item) => (
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
                          placeholder="Nombre del CD"
                          className="w-full bg-[#0a0a0a] border border-[#6B5CE7] rounded-sm px-1.5 py-0.5 text-xs text-[#e0e0e0] outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="w-full text-left text-xs text-[#888888] hover:text-[#e0e0e0] truncate transition-colors"
                          title="Click para cambiar el CD"
                        >
                          {item.filename}
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
            </div>
          ))}
        </div>
      )}

      {pendingFiles && (
        <CdNameModal
          files={pendingFiles}
          onConfirm={(cdName) => handleUpload(pendingFiles, cdName)}
          onCancel={() => { setPendingFiles(null); if (inputRef.current) inputRef.current.value = '' }}
        />
      )}
    </div>
  )
}
