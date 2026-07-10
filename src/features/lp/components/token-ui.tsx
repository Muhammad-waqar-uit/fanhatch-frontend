'use client'

/** Shared LP-screen primitives so Swap / Liquidity / Farm read as one system. */
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'

export type TokenMeta = { symbol: string; dot: string }

/** Brand dots: ETH Ethereum-blue, $FANS the accent, FANS-LP the positive tone. */
export const TOKENS = {
  eth: { symbol: 'ETH', dot: '#627EEA' },
  fans: { symbol: '$FANS', dot: 'var(--color-accent)' },
  lp: { symbol: 'FANS-LP', dot: 'var(--color-positive)' },
} as const satisfies Record<string, TokenMeta>

/** Safe number coercion (NaN → 0). */
export const num = (v?: string | number): number => {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export function TokenPill({ token }: { token: TokenMeta }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-2.5 py-1.5 text-sm font-semibold text-[var(--color-fg)]">
      <span className="size-2.5 rounded-full" style={{ background: token.dot }} />
      {token.symbol}
    </span>
  )
}

/**
 * Amount field — a labelled group (label above, input row, "available" hint below),
 * matching the Figma "Pay / Receive / Deposit" layout. Optional MAX + loading spinner.
 */
export function TokenField({
  label,
  token,
  value,
  available,
  placeholder = '0.0',
  editable = false,
  loading = false,
  onChange,
  onMax,
}: {
  label?: string
  token: TokenMeta
  value: string
  available?: number
  placeholder?: string
  editable?: boolean
  loading?: boolean
  onChange?: (v: string) => void
  onMax?: () => void
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] p-3">
      {label ? (
        <span className="text-sm font-medium text-[var(--color-fg)]">{label}</span>
      ) : null}
      <div className={cn('flex items-center gap-2 rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2.5', label && 'mt-2')}>
        <div className="relative min-w-0 flex-1">
          <input
            inputMode="decimal"
            readOnly={!editable}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value.replace(/[^0-9.]/g, ''))}
            className={cn(
              'w-full bg-transparent text-2xl font-semibold text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]',
              loading && 'opacity-40',
            )}
            aria-label={`${label ?? token.symbol} amount`}
          />
          {loading ? (
            <Loader2 className="absolute left-0 top-1/2 size-4 -translate-y-1/2 animate-spin text-[var(--color-muted)]" />
          ) : null}
        </div>
        {editable && onMax ? (
          <button
            type="button"
            onClick={onMax}
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-surface)]"
          >
            MAX
          </button>
        ) : null}
        <TokenPill token={token} />
      </div>
      {available != null ? (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {formatNumber(available, { compact: true })} {token.symbol} Available
        </p>
      ) : null}
    </div>
  )
}

/** A framed "label ─ value" row (Balance, LP Bonus …) for the Your LP card. */
export function KeyValueRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="font-semibold text-[var(--color-fg)]">{children}</span>
    </div>
  )
}

/** A key/value row for the details block. */
export function DetailRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--color-muted)]">{term}</dt>
      <dd className="font-medium text-[var(--color-fg)]">{children}</dd>
    </div>
  )
}

/** Full-width segmented control (Add/Remove, Stake/Unstake). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex w-full rounded-[var(--radius)] border border-[var(--color-border)] p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            'flex-1 rounded-[calc(var(--radius)-0.25rem)] py-1.5 text-sm font-medium capitalize transition-colors',
            value === o
              ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** A labelled stat tile. */
export function StatTile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[var(--radius)] bg-[var(--color-surface-2)] p-2.5">
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
      <div className={cn('mt-0.5 font-semibold', accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-fg)]')}>
        {value}
      </div>
    </div>
  )
}
