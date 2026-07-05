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
  placeholder?: string
}

export function SearchSelect({ label, options, selectedId, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.id === selectedId)
  const displayValue = open ? query : (selected?.name ?? '')

  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selected ? selected.name : '')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selected])

  function handleSelect(option: Option) {
    onSelect(option.id)
    setQuery(option.name)
    setOpen(false)
  }

  function handleClear() {
    onSelect('')
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="block text-[#888888] text-xs uppercase tracking-wider mb-1">{label}</span>
      <input
        value={displayValue}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setQuery(selected?.name ?? ''); setOpen(true) }}
        placeholder={placeholder ?? `Buscar ${label.toLowerCase()}...`}
        className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#6B5CE7] rounded-sm px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#555555] outline-none transition-colors"
      />

      {open && (
        <div className="absolute z-30 top-full mt-1 w-full bg-[#111111] border border-[#2a2a2a] rounded-sm shadow-lg max-h-48 overflow-y-auto">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear() }}
            className="w-full text-left px-3 py-2 text-sm text-[#888888] hover:bg-[#1a1a1a]"
          >
            Sin especificar
          </button>
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
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-[#555555]">Sin resultados</p>
          )}
        </div>
      )}
    </div>
  )
}
