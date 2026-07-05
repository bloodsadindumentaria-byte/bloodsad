import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import type { MediaItem } from '@/types'

interface Props {
  multiple: boolean
  titleHint: string
  onConfirm: (urls: string[]) => void
  onClose: () => void
}

export function MediaPickerModal({ multiple, titleHint, onConfirm, onClose }: Props) {
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
        const hint = titleHint.toLowerCase().trim()
        const sorted = hint
          ? [
              ...all.filter((i) => i.label?.toLowerCase().trim() === hint),
              ...all.filter((i) => i.label?.toLowerCase().trim() !== hint),
            ]
          : all
        setItems(sorted)
        setLoading(false)
      })
  }, [titleHint])

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
          {!loading && titleHint && items.some((i) => i.label?.toLowerCase().trim() === titleHint.toLowerCase().trim()) && (
            <p className="text-[#6B5CE7] text-xs mb-3 uppercase tracking-wider">
              ↑ Imágenes de "{titleHint}" al inicio
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
                const isMatch = titleHint
                  ? item.label?.toLowerCase().trim() === titleHint.toLowerCase().trim()
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
