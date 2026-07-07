'use client'

import { formatNumber } from '@/shared/lib/format'
import type { WalletToken } from '../types'

/** Lettered-avatar for a token symbol. */
function TokenAvatar({ symbol }: { symbol: string }) {
  const letter = symbol.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase() || '?'
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-sm font-semibold text-[var(--color-accent)]">
      {letter}
    </span>
  )
}

/**
 * One token in the wallet Tokens list — avatar + name/symbol on the left,
 * right-aligned balance. Balance-only (no fiat pricing).
 */
export function TokenRow({ token }: { token: WalletToken }) {
  const { symbol, name, balance } = token

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <TokenAvatar symbol={symbol} />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{name}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{symbol}</p>
      </div>

      <div className="ml-auto text-right">
        <p className="text-sm font-semibold text-[var(--color-fg)]">
          {formatNumber(balance)} {symbol}
        </p>
      </div>
    </div>
  )
}
