'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/shared/lib/cn'
import { formatPct, formatUsd } from '@/shared/lib/format'
import type { WalletOverviewDto } from '../types'

/** Net Worth + $FANS Price header cards (figma wallet top row). */
export function NetWorthHeader({ overview }: { overview: WalletOverviewDto }) {
  const netWorth = Number(overview.netWorthUsd)
  const pct = overview.change24hPct
  const changeUsd = (netWorth * pct) / 100
  const up = pct >= 0
  const Trend = up ? TrendingUp : TrendingDown
  const toneClass = up ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'

  const fansPrice = Number(overview.fansPriceUsd)
  // $FANS is sub-dollar, so allow more precision than formatUsd's 2 dp.
  const fansPriceLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(fansPrice)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="flex flex-col gap-1 p-4">
        <p className="text-xs text-[var(--color-muted)]">Net Worth</p>
        <p className="text-2xl font-semibold text-[var(--color-fg)]">{formatUsd(netWorth)}</p>
        <div className={cn('flex items-center gap-1 text-sm', toneClass)}>
          <Trend className="size-4" />
          <span>{formatPct(pct)}</span>
          <span className="text-[var(--color-muted)]">·</span>
          <span>
            {changeUsd < 0 ? '-' : '+'}
            {formatUsd(Math.abs(changeUsd))}
          </span>
          <span className="text-[var(--color-muted)]">24h</span>
        </div>
      </Card>

      <Card className="flex flex-col gap-1 p-4">
        <p className="text-xs text-[var(--color-muted)]">$FANS Price</p>
        <p className="text-2xl font-semibold text-[var(--color-fg)]">{fansPriceLabel}</p>
        <div className={cn('flex items-center gap-1 text-sm', toneClass)}>
          <Trend className="size-4" />
          <span>{formatPct(pct)}</span>
          <span className="text-[var(--color-muted)]">24h</span>
        </div>
      </Card>
    </div>
  )
}
