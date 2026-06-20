import { useEffect, useRef, useState } from 'react'
// useRef se mantiene solo para reset del input value
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import type { MediaItem } from '@/types'

async function uploadOne(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('albums')
    .upload(path, file, { upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('albums').getPublicUrl(path)
  return data.publicUrl
}

async function identifyFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl)
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  const imageBase64 = btoa(binary)
  const mediaType = res.headers.get('content-type') || 'image/jpeg'
  const { data, error } = await supabase.functions.invoke('dynamic-action', {
    body: { imageBase64, mediaType },
  })
  if (error) throw error
  const name = ((data as { name: string }).name ?? '?').trim()
  return name === '?' ? '' : name
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number; failed: number; lastError: string } | null>(null)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analyzingAll, setAnalyzingAll] = useState(false)
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
    const arr = Array.from(files).slice(0, 99)
    let done = 0
    let failed = 0
    let lastError = ''
    setUploadProgress({ done: 0, total: arr.length, failed: 0, lastError: '' })

    for (const file of arr) {
      try {
        const url = await uploadOne(file)
        await supabase.from('media').insert({ url, filename: file.name, label: null })
      } catch (err) {
        failed++
        lastError = err instanceof Error ? err.message : String(err)
      }
      done++
      setUploadProgress({ done, total: arr.length, failed, lastError })
    }

    await fetchItems()
    if (failed > 0) setError(`${failed} imagen${failed > 1 ? 'es' : ''} fallaron. Último error: ${lastError}`)
    setUploading(false)
    setUploadProgress(null)
    if (inputRef.current) inputRef.current.value = ''
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
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label: editingLabel || null } : i)))
    setEditingId(null)
  }

  async function analyzeOne(item: MediaItem) {
    setAnalyzingId(item.id)
    try {
      const name = await identifyFromUrl(item.url)
      if (name) {
        await supabase.from('media').update({ label: name }).eq('id', item.id)
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, label: name } : i)))
      }
    } catch { /* silencioso */ }
    setAnalyzingId(null)
  }

  async function analyzeAll() {
    const unidentified = items.filter((i) => !i.label)
    if (!unidentified.length) return
    setAnalyzingAll(true)
    for (const item of unidentified) {
      setAnalyzingId(item.id)
      try {
        const name = await identifyFromUrl(item.url)
        if (name) {
          await supabase.from('media').update({ label: name }).eq('id', item.id)
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, label: name } : i)))
        }
      } catch { /* continúa */ }
    }
    setAnalyzingId(null)
    setAnalyzingAll(false)
  }

  const visibleItems = query.trim()
    ? items.filter((i) =>
        [i.label ?? '', i.filename].some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : items

  const unidentifiedCount = items.filter((i) => !i.label).length

  const grouped = visibleItems.reduce<Record<string, MediaItem[]>>((acc, item) => {
    const key = item.label ?? '(sin identificar)'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === '(sin identificar)') return 1
    if (b === '(sin identificar)') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#e0e0e0]">Biblioteca de medios</h1>
        <Link to="/admin" className="text-[#888888] hover:text-[#6B5CE7] text-sm transition-colors">
          ← Dashboard
        </Link>
      </div>

      {/* Zona de upload — label nativo para iOS Safari */}
      <label
        htmlFor="media-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length && !uploading) handleUpload(e.dataTransfer.files)
        }}
        className={`block border border-dashed rounded-sm p-8 text-center transition-colors duration-200 mb-4 ${
          uploading
            ? 'border-[#6B5CE7] cursor-default pointer-events-none'
            : 'border-[#2a2a2a] hover:border-[#6B5CE7] cursor-pointer'
        }`}
      >
        {uploading && uploadProgress ? (
          <div className="space-y-2">
            <p className="text-[#6B5CE7] text-sm">
              Subiendo {uploadProgress.done} de {uploadProgress.total}
              {uploadProgress.failed > 0 && (
                <span className="text-[#c0392b]"> · {uploadProgress.failed} fallidas</span>
              )}
            </p>
            <div className="w-full bg-[#2a2a2a] rounded-full h-1.5">
              <div
                className="bg-[#6B5CE7] h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
              />
            </div>
            {uploadProgress.lastError && (
              <p className="text-[#c0392b] text-xs break-all">{uploadProgress.lastError}</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-[#888888] text-sm">Tocá para seleccionar imágenes</p>
            <p className="text-[#444444] text-xs mt-1">Hasta 99 fotos</p>
          </>
        )}
        <input
          id="media-upload"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
          onChange={(e) => {
            if (e.target.files?.length) {
              handleUpload(e.target.files)
              e.target.value = ''
            }
          }}
        />
      </label>

      {/* Barra de acciones */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Buscar por CD o archivo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors"
        />
        {unidentifiedCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            disabled={analyzingAll}
            onClick={analyzeAll}
            className="whitespace-nowrap border-[#6B5CE7] text-[#6B5CE7] hover:bg-[#6B5CE7] hover:text-white"
          >
            {analyzingAll ? 'Analizando...' : `Analizar todas (${unidentifiedCount})`}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-[#c0392b] mb-4">{error}</p>}

      {loading ? (
        <p className="text-[#888888]">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-[#888888] text-center py-16">No hay imágenes todavía.</p>
      ) : visibleItems.length === 0 ? (
        <p className="text-[#888888] text-center py-16">Sin resultados para "{query}"</p>
      ) : (
        <div className="space-y-8">
          {groupKeys.map((cd) => (
            <div key={cd}>
              <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${
                cd === '(sin identificar)' ? 'text-[#555555]' : 'text-[#6B5CE7]'
              }`}>
                {cd}
                {cd === '(sin identificar)' && (
                  <span className="ml-2 normal-case tracking-normal text-[#444444]">
                    — usá "Analizar todas" para identificarlas con IA
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {grouped[cd].map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#111111] border border-[#2a2a2a] rounded-sm overflow-hidden hover:border-[#6B5CE7] transition-colors duration-200"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                      <img
                        src={item.url}
                        alt={item.label ?? item.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {analyzingId === item.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[#6B5CE7] text-xs animate-pulse">Analizando...</span>
                        </div>
                      )}
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
                          className={`w-full text-left text-xs truncate transition-colors ${
                            item.label
                              ? 'text-[#888888] hover:text-[#e0e0e0]'
                              : 'text-[#444444] hover:text-[#888888] italic'
                          }`}
                          title="Click para editar"
                        >
                          {item.label ?? item.filename}
                        </button>
                      )}

                      <div className="flex gap-1">
                        {!item.label && (
                          <button
                            disabled={analyzingId === item.id || analyzingAll}
                            onClick={() => analyzeOne(item)}
                            className="flex-1 text-[10px] text-[#6B5CE7] hover:text-white hover:bg-[#6B5CE7] border border-[#6B5CE7] rounded-sm py-0.5 transition-colors disabled:opacity-40"
                          >
                            IA
                          </button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 h-5 text-[10px]"
                          onClick={() => handleDelete(item)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
