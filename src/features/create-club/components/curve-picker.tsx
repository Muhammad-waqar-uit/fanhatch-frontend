'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/shared/lib/cn'
import { estimatePrice } from '../api/create-club.api'
import { CURVE_PRESETS } from '../mocks'
import type { CurvePreset, CurveType } from '../types'

/** Member index we estimate the key price at, per the figma subtitle. */
const ESTIMATE_AT = 50

/**
 * Build an SVG path for a curve preview over [0, ESTIMATE_AT] members,
 * normalised into the given viewBox. Sampled from the same `estimatePrice`
 * used for the readout so the shape matches the numbers.
 */
function curvePath(type: CurveType, width: number, height: number, pad = 4): string {
  const samples = 24
  const prices = Array.from({ length: samples + 1 }, (_, i) =>
    estimatePrice(type, (i / samples) * ESTIMATE_AT),
  )
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  return prices
    .map((p, i) => {
      const x = pad + (i / samples) * innerW
      const y = pad + innerH - ((p - min) / span) * innerH
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function CurveCard({
  preset,
  selected,
  onSelect,
}: {
  preset: CurvePreset
  selected: boolean
  onSelect: (type: CurveType) => void
}) {
  const width = 120
  const height = 56
  const est = estimatePrice(preset.type, ESTIMATE_AT)

  return (
    <button
      type="button"
      onClick={() => onSelect(preset.type)}
      aria-pressed={selected}
      className="text-left focus-visible:outline-none"
    >
      <Card
        className={cn(
          'flex h-full flex-col gap-3 p-4 transition-colors',
          selected
            ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
            : 'hover:border-[var(--color-muted)]',
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--color-fg)]">{preset.label}</span>
          <span
            className={cn(
              'size-3 rounded-full border',
              selected
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                : 'border-[var(--color-border)]',
            )}
            aria-hidden
          />
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-14 w-full rounded-md bg-[var(--color-surface-2)]"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={curvePath(preset.type, width, height)}
            fill="none"
            stroke={preset.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="text-xs text-[var(--color-muted)]">{preset.blurb}</p>

        <div className="mt-auto text-xs">
          <span className="text-[var(--color-muted)]">Est. at {ESTIMATE_AT} members</span>
          <span className="ml-1 font-medium text-[var(--color-fg)]">{est.toFixed(3)} $FANS</span>
        </div>
      </Card>
    </button>
  )
}

export function CurvePicker({
  value,
  onChange,
}: {
  value: CurveType | null
  onChange: (type: CurveType) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">Select price curve</h3>
        <p className="text-xs text-[var(--color-muted)]">
          How the price of your club key changes as people trade. Select a curve to estimate price at{' '}
          {ESTIMATE_AT} members.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CURVE_PRESETS.map((preset) => (
          <CurveCard
            key={preset.type}
            preset={preset}
            selected={value === preset.type}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  )
}
