import { useRef, useState } from 'react'

interface Props {
  label: string
  preview?: string | string[]
  multiple?: boolean
  onFiles: (files: FileList) => void
  onPickFromLibrary: () => void
}

export function DropZone({ label, preview, multiple = false, onFiles, onPickFromLibrary }: Props) {
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
