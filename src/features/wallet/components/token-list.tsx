'use client'

import { Card } from '@/components/ui/card'
import type { WalletToken } from '../types'
import { TokenRow } from './token-row'

/**
 * Tokens section — a single Card of token rows (ETH, $FANS) with name + balance.
 * Balance-only; no fiat pricing.
 */
export function TokenList({ tokens }: { tokens: WalletToken[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-fg)]">Tokens</h2>
      <Card className="divide-y divide-[var(--color-border)]">
        {tokens.map((token) => (
          <TokenRow key={token.symbol} token={token} />
        ))}
      </Card>
    </section>
  )
}
