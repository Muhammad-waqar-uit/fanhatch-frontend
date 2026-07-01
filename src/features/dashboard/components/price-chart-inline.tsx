import { Badge } from '@/components/ui/badge'
import { formatPct } from '@/shared/lib/format'
import type { ClubPrice } from '../types'

/** Small inline club price card with an SVG sparkline. Presentational. */
export function PriceChartInline({ club }: { club: ClubPrice }) {
  const up = club.changePct >= 0
  const stroke = up ? 'var(--color-positive)' : 'var(--color-negative)'

  const width = 120
  const height = 36
  const prices = club.history.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const step = prices.length > 1 ? width / (prices.length - 1) : width

  const points = prices
    .map((price, i) => {
      const x = i * step
      // Invert y: higher price = smaller y.
      const y = height - ((price - min) / span) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const tvUp = club.tradingValueEth >= 0
  const tvSign = tvUp ? '+' : ''

  return (
    <div className="mt-3 flex items-center gap-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-fg)]">${club.ticker}</span>
          <Badge tone={up ? 'positive' : 'negative'}>{formatPct(club.changePct)}</Badge>
        </div>
        <div className="mt-1 text-lg font-semibold text-[var(--color-fg)]">
          {club.priceEth.toFixed(3)} ETH
        </div>
        <div className="mt-0.5 text-xs text-[var(--color-muted)]">
          Club Trading Value{' '}
          <span className={tvUp ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}>
            {tvSign}
            {club.tradingValueEth.toFixed(3)} ETH
          </span>
        </div>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="ml-auto shrink-0"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
