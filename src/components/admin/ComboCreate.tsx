import { useEffect, useRef, useState } from 'react'

interface Option {
  id: string
  name: string
}

interface Props {
  label: string
  options: Option[]
  selectedId: string
  onSelect: (id: string) => void
  onCreate: (name: string) => Promise<string> // returns new id
}

export function ComboCreate({ label, options, selectedId, onSelect, onCreate }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.id === selectedId)

  // Sincronizar texto con selección actual
  useEffect(() => {
    if (selected && !open) setQuery(selected.name)
  }, [selected, open])

  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options

  const showCreate = query.trim() && !options.some(
    (o) => o.name.toLowerCase() === query.trim().toLowerCase()
  )

  // Cerrar al click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (selected) setQuery(selected.name)
        else setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selected])

  async function handleCreate() {
    const name = query.trim()
    if (!name) return
    setCreating(true)
    try {
      const id = await onCreate(name)
      onSelect(id)
      setOpen(false)
    } finally {
      setCreating(false)
    }
  }

  function handleSelect(option: Option) {
    onSelect(option.id)
    setQuery(option.name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="block text-[#888888] text-xs uppercase tracking-wider mb-1">{label}</span>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={`Buscar o crear ${label.toLowerCase()}...`}
        className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors"
      />

      {open && (filtered.length > 0 || showCreate) && (
        <div className="absolute z-30 top-full mt-1 w-full bg-[#111111] border border-[#2a2a2a] rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((option) => (
            <button
              key={option.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(option) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                option.id === selectedId
                  ? 'bg-[#6B5CE7] text-white'
                  : 'text-[#e0e0e0] hover:bg-[#1a1a1a]'
              }`}
            >
              {option.name}
            </button>
          ))}
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
