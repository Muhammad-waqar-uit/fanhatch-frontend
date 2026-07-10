import { useId } from 'react'
import { formatPct } from '@/shared/lib/format'
import type { ClubPrice } from '../types'

/**
 * Inline club price card shown inside a post: a header row (name + 24h change),
 * the current price alongside its trading-value delta, and a full-width area
 * sparkline underneath. Presentational.
 */
export function PriceChartInline({ club }: { club: ClubPrice }) {
  const up = club.changePct >= 0
  const stroke = up ? 'var(--color-positive)' : 'var(--color-negative)'
  const gradientId = useId()

  // Fixed viewBox coordinate space; the SVG stretches to the card width.
  const width = 300
  const height = 96
  const prices = club.history.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const step = prices.length > 1 ? width / (prices.length - 1) : width

  const coords = prices.map((price, i) => {
    const x = i * step
    // Invert y (higher price = smaller y) and inset a few px top/bottom.
    const y = height - ((price - min) / span) * (height - 12) - 6
    return { x, y }
  })
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${line} ${width},${height} 0,${height}`

  const tvUp = club.tradingValueEth >= 0
  const tvSign = tvUp ? '+' : ''

  return (
    <div className="mt-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--color-fg)]">${club.ticker}</span>
        <span className={up ? 'text-sm font-medium text-[var(--color-positive)]' : 'text-sm font-medium text-[var(--color-negative)]'}>
          {formatPct(club.changePct)}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold text-[var(--color-fg)]">{club.priceEth.toFixed(3)} ETH</span>
        <span className={tvUp ? 'text-sm font-semibold text-[var(--color-positive)]' : 'text-sm font-semibold text-[var(--color-negative)]'}>
          {tvSign}
          {club.tradingValueEth.toFixed(3)} ETH
        </span>
      </div>
      <div className="mt-0.5 text-xs text-[var(--color-muted)]">Club Trading Value</div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="mt-3 h-24 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradientId})`} stroke="none" />
        <polyline
          points={line}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
