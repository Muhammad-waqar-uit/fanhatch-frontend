'use client'

import { Card } from '@/components/ui/card'
import { formatUsd } from '@/shared/lib/format'
import type { WalletOverviewDto } from '../types'

/** "↓13% -$18.77 (24h)" change line — colored arrow+pct, muted amount. */
function ChangeLine({ pct, changeUsd }: { pct: number; changeUsd: number }) {
  const up = pct >= 0
  const tone = up ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
  return (
    <div className="flex items-center justify-center gap-1.5 text-sm">
      <span className={tone}>
        {up ? '↑' : '↓'}
        {Math.abs(pct)}%
      </span>
      <span className="text-[var(--color-muted)]">
        {changeUsd < 0 ? '-' : '+'}
        {formatUsd(Math.abs(changeUsd))} (24h)
      </span>
    </div>
  )
}

/** Net Worth + $FANS Price header cards (figma wallet top row). */
export function NetWorthHeader({ overview }: { overview: WalletOverviewDto }) {
  const netWorth = Number(overview.netWorthUsd)
  const pct = overview.change24hPct
  const changeUsd = (netWorth * pct) / 100

  const fansPrice = Number(overview.fansPriceUsd)
  // $FANS is sub-dollar, so allow more precision than formatUsd's 2 dp.
  const fansPriceLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(fansPrice)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="flex flex-col items-center gap-1 p-4 text-center">
        <p className="text-xs text-[var(--color-muted)]">Net Worth</p>
        <p className="text-3xl font-bold text-[var(--color-fg)]">{formatUsd(netWorth)}</p>
        <ChangeLine pct={pct} changeUsd={changeUsd} />
      </Card>

      <Card className="flex flex-col items-center gap-1 p-4 text-center">
        <p className="text-xs text-[var(--color-muted)]">$FANS Price</p>
        <p className="text-3xl font-bold text-[#2dd4bf]">{fansPriceLabel}</p>
        <ChangeLine pct={pct} changeUsd={changeUsd} />
      </Card>
    </div>
  )
}
