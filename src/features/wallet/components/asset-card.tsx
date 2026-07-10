'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** Teal $FANS / rewards token dot used inside value boxes. */
export function TealDot() {
  return <span className="inline-block size-2.5 shrink-0 rounded-full bg-[#2dd4bf]" />
}

/** Small diamond glyph for ETH amounts inside value boxes. */
export function EthDiamond() {
  return <span className="inline-block size-2.5 shrink-0 rotate-45 bg-[var(--color-fg)]" />
}

/** Centered value inside a card's value box — optional leading glyph + value. */
export function TokenValue({ glyph, children }: { glyph?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 text-lg font-semibold text-[var(--color-fg)]">
      {glyph}
      <span>{children}</span>
    </div>
  )
}

/** Sub-line under a value: colored ↑/↓ pct + a muted amount. */
export function ChangeSub({ pct, secondary }: { pct?: number; secondary: string }) {
  const up = (pct ?? 0) >= 0
  const tone = up ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
  return (
    <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
      {pct !== undefined ? (
        <span className={tone}>
          {up ? '↑' : '↓'}
          {Math.abs(pct)}%
        </span>
      ) : null}
      <span className="text-[var(--color-muted)]">{secondary}</span>
    </div>
  )
}

/**
 * Reusable wallet asset tile (figma wallet grid) — a centered emoji/icon, a
 * title + subtitle, a value box (children), and one full-width action button.
 * Used for Ethereum, $FANS, Keys and the reward tiles.
 */
export function AssetCard({
  icon,
  title,
  subtitle,
  children,
  buttonLabel,
  onButtonClick,
  buttonDisabled,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
  buttonLabel: string
  onButtonClick: () => void
  buttonDisabled?: boolean
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-4 text-center">
      <div className="text-3xl leading-none" aria-hidden>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{title}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
      </div>

      <div className="w-full rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-3">
        {children}
      </div>

      <Button
        className="mt-auto w-full"
        variant="primary"
        size="sm"
        onClick={onButtonClick}
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </Button>
    </Card>
  )
}
