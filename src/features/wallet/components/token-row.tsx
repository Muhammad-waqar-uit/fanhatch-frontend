'use client'

import { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { formatNumber, formatPct, formatUsd } from '@/shared/lib/format'
import type { WalletToken } from '../types'

/** Sub-dollar tokens ($FANS) need more precision than formatUsd's 2 dp. */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price !== 0 && Math.abs(price) < 1 ? 4 : 2,
  }).format(price)
}

/** Token logo with a lettered-avatar fallback (broken/missing image, $FANS). */
function TokenAvatar({ logoUrl, symbol }: { logoUrl?: string; symbol: string }) {
  const [broken, setBroken] = useState(false)
  const letter = symbol.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase() || '?'

  if (logoUrl && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="size-10 shrink-0 rounded-full bg-[var(--color-surface-2)] object-cover"
        onError={() => setBroken(true)}
      />
    )
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-sm font-semibold text-[var(--color-accent)]">
      {letter}
    </span>
  )
}

/** 24h change chip — green (up) / red (down). */
function ChangeChip({ change }: { change: number }) {
  const up = change >= 0
  const Trend = up ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs font-medium',
        up ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]',
      )}
    >
      <Trend className="size-3" />
      {formatPct(change)}
    </span>
  )
}

/**
 * One token in the wallet Tokens list — matches asset-card's visual language
 * (avatar + name/symbol on the left, right-aligned USD value with a balance ·
 * price secondary line, plus a 24h % chip).
 */
export function TokenRow({ token }: { token: WalletToken }) {
  const { symbol, name, logoUrl, balance, price, valueUsd, change24h } = token

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <TokenAvatar logoUrl={logoUrl} symbol={symbol} />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{name}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{symbol}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {change24h != null ? <ChangeChip change={change24h} /> : null}
        <div className="text-right">
          <p className="text-sm font-semibold text-[var(--color-fg)]">
            {valueUsd != null ? formatUsd(valueUsd) : '—'}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {formatNumber(balance)} {symbol}
            {' · '}
            {price != null ? formatPrice(price) : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
