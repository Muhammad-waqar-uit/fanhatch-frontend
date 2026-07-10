'use client'

import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { IMAGE_MIME, MAX_IMAGE_MB, uploadImage } from '@/shared/lib/upload'

/**
 * Drag/drop + click image picker that uploads to POST /media and returns a URL.
 * Falls back to a URL-paste input (so it works even before storage is set up).
 * `shape='circle'` for avatars, `'rect'` for club/cover photos.
 */
export function ImageUpload({
  value,
  onChange,
  folder = 'misc',
  label = 'Tap to add photo',
  shape = 'rect',
}: {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  shape?: 'circle' | 'rect'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pasteMode, setPasteMode] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!IMAGE_MIME.includes(file.type)) {
      setError('PNG, JPEG, WEBP or GIF only')
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Max ${MAX_IMAGE_MB}MB`)
      return
    }
    setBusy(true)
    try {
      const { url } = await uploadImage(file, folder)
      onChange(url)
    } catch {
      setError('Upload failed — paste a URL instead')
      setPasteMode(true)
    } finally {
      setBusy(false)
    }
  }

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-[var(--radius)]'
  const box = shape === 'circle' ? 'size-24' : 'h-32 w-full'

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          void handleFile(e.dataTransfer.files?.[0])
        }}
        aria-label={label}
        className={cn(
          'relative flex items-center justify-center overflow-hidden border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]',
          rounded,
          box,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className={cn('size-full object-cover', rounded)} />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            {shape === 'circle' ? <ImagePlus className="size-6" /> : <UploadCloud className="size-6" />}
            {label}
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="size-5 animate-spin text-white" />
          </span>
        ) : null}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_MIME.join(',')}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-3 text-xs">
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          >
            <X className="size-3" /> Remove
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setPasteMode((v) => !v)}
          className="text-[var(--color-accent)] hover:underline"
        >
          {pasteMode ? 'Use file upload' : 'Paste a URL'}
        </button>
      </div>

      {pasteMode ? (
        <input
          type="url"
          defaultValue={value}
          onBlur={(e) => onChange(e.target.value.trim())}
          placeholder="https://…"
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
        />
      ) : null}

      {error ? <p className="text-xs text-[var(--color-negative)]">{error}</p> : null}
    </div>
  )
}
