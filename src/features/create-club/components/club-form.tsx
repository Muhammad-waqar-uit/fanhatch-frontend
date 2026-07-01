'use client'

import { ImagePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { estimatePrice } from '../api/create-club.api'
import type { ClubSocials, CreateClubInput, CurveType } from '../types'
import { CurvePicker } from './curve-picker'
import { SocialsFields } from './socials-fields'

/** Strip a leading `$` and uppercase — the stored ticker form. */
function normalizeTicker(raw: string): string {
  return raw.replace(/^\$+/, '').toUpperCase().trim()
}

export interface ClubFormProps {
  submitting?: boolean
  error?: string | null
  onSubmit: (input: CreateClubInput) => void
}

/**
 * The main create-club form: photo, name, ticker, description, curve picker,
 * buy-first-keys readout, and optional socials. Simple controlled state (no
 * react-hook-form); validation is name + ticker + curve.
 */
export function ClubForm({ submitting, error, onSubmit }: ClubFormProps) {
  const [avatarUrl, setAvatarUrl] = useState('')
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [description, setDescription] = useState('')
  const [curveType, setCurveType] = useState<CurveType | null>(null)
  const [firstKeyQty, setFirstKeyQty] = useState(1)
  const [socials, setSocials] = useState<ClubSocials>({})
  const [touched, setTouched] = useState(false)

  const normalizedTicker = normalizeTicker(ticker)
  const nameError = name.trim() === '' ? 'Name is required' : null
  const tickerError = normalizedTicker === '' ? 'Ticker is required' : null
  const curveError = curveType === null ? 'Select a price curve' : null
  const valid = !nameError && !tickerError && !curveError

  // First key is free; subsequent keys estimated on the chosen curve.
  const spend = useMemo(() => {
    if (!curveType) return 0
    let total = 0
    for (let i = 1; i < firstKeyQty; i++) total += estimatePrice(curveType, i)
    return total
  }, [curveType, firstKeyQty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid || !curveType) return
    const trimmedSocials: ClubSocials = {}
    if (socials.x?.trim()) trimmedSocials.x = socials.x.trim()
    if (socials.email?.trim()) trimmedSocials.email = socials.email.trim()
    if (socials.website?.trim()) trimmedSocials.website = socials.website.trim()
    onSubmit({
      name: name.trim(),
      ticker: normalizedTicker,
      description: description.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      curveType,
      socials: Object.keys(trimmedSocials).length ? trimmedSocials : undefined,
      firstKeyQty,
    })
  }

  const showError = (msg: string | null) => touched && msg

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Photo upload area (web2: paste a URL; real upload is a later swap). */}
      <div className="flex flex-col items-center gap-2">
        <label
          className={cn(
            'flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-muted)]',
          )}
          style={
            avatarUrl
              ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          {!avatarUrl && (
            <>
              <ImagePlus className="size-5" />
              <span className="text-[10px]">Tap to add photo</span>
            </>
          )}
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Image URL"
            className="sr-only"
          />
        </label>
        <Input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Photo URL (optional)"
          className="max-w-xs"
        />
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">Name</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Club name"
            aria-invalid={!!showError(nameError)}
          />
          {showError(nameError) && (
            <span className="text-xs text-[var(--color-negative)]">{nameError}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">$TICKER</span>
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="$TICKER"
            aria-invalid={!!showError(tickerError)}
          />
          {showError(tickerError) && (
            <span className="text-xs text-[var(--color-negative)]">{tickerError}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">Club Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is your club about?"
            rows={3}
            className="w-full resize-none rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          />
        </label>
      </div>

      <CurvePicker value={curveType} onChange={setCurveType} />
      {showError(curveError) && (
        <span className="-mt-4 text-xs text-[var(--color-negative)]">{curveError}</span>
      )}

      {/* Buy club keys */}
      <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">Buy club keys</h3>
        <p className="text-xs text-[var(--color-muted)]">
          Be the first holder of your club key. The first key is free.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">Quantity</span>
          <Input
            type="number"
            min={1}
            value={firstKeyQty}
            onChange={(e) => setFirstKeyQty(Math.max(1, Number(e.target.value) || 1))}
            className="max-w-[120px]"
          />
        </label>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-muted)]">Your Balance</span>
          <span className="text-[var(--color-fg)]">— $FANS</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-muted)]">You&apos;ll spend</span>
          <span className="font-medium text-[var(--color-fg)]">{spend.toFixed(3)} $FANS</span>
        </div>
      </div>

      <SocialsFields value={socials} onChange={setSocials} />

      {error && <p className="text-sm text-[var(--color-negative)]">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create your club'}
      </Button>
    </form>
  )
}
