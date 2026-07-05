import { useEffect, useRef, useState } from 'react'

interface Option {
  id: string
  name: string
}

interface Props {
  label: string
  options: Option[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onCreate: (name: string) => Promise<string> // returns new id
}

export function GenreMultiSelect({ label, options, selectedIds, onChange, onCreate }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.filter((o) => selectedIds.includes(o.id))

  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options

  const showCreate = query.trim() && !options.some(
    (o) => o.name.toLowerCase() === query.trim().toLowerCase()
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
  }

  function remove(id: string) {
    onChange(selectedIds.filter((i) => i !== id))
  }

  async function handleCreate() {
    const name = query.trim()
    if (!name) return
    setCreating(true)
    try {
      const id = await onCreate(name)
      onChange([...selectedIds, id])
      setQuery('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="block text-[#888888] text-xs uppercase tracking-wider mb-1">{label}</span>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 bg-[rgba(107,92,231,0.15)] border border-[#6B5CE7]/40 text-[#e0e0e0] text-xs px-2 py-1 rounded-sm"
            >
              {o.name}
              <button
                type="button"
                onClick={() => remove(o.id)}
                className="text-[#888888] hover:text-[#e0e0e0] leading-none"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={`Buscar o crear ${label.toLowerCase()}...`}
        className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors"
      />

      {open && (filtered.length > 0 || showCreate) && (
        <div className="absolute z-30 top-full mt-1 w-full bg-[#111111] border border-[#2a2a2a] rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((option) => {
            const isSelected = selectedIds.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); toggle(option.id) }}
                className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm transition-colors ${
                  isSelected ? 'bg-[#6B5CE7] text-white' : 'text-[#e0e0e0] hover:bg-[#1a1a1a]'
                }`}
              >
                {option.name}
                {isSelected && <span>✓</span>}
              </button>
            )
          })}
          {showCreate && (
            <button
              type="button"
              disabled={creating}
              onMouseDown={(e) => { e.preventDefault(); handleCreate() }}
              className="w-full text-left px-3 py-2 text-sm text-[#6B5CE7] hover:bg-[#1a1a1a] border-t border-[#2a2a2a] disabled:opacity-50"
            >
              {creating ? 'Creando...' : `+ Crear "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
