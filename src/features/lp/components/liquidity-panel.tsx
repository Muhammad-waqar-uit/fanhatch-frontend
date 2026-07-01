'use client'

/**
 * Liquidity: add (ETH + $FANS deposit) or remove (LP shares), with the caller's
 * current position summary. "Farmers receive a share of swap fees." Mutations
 * surface 400 (insufficient balance) inline.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { formatNumber, formatUsd } from '@/shared/lib/format'
import { lpErrorMessage, mockWalletBalances } from '../api/lp.api'
import { useAddLiquidity, usePosition, useRemoveLiquidity } from '../hooks/use-lp'

export function LiquidityPanel() {
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const { data: position } = usePosition()
  const balances = mockWalletBalances()

  return (
    <div className="flex flex-col gap-3">
      {/* Position summary */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Your Position</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <Stat label="LP shares" value={formatNumber(Number(position?.shares ?? 0))} />
            <Stat
              label="Pooled ETH"
              value={formatNumber(Number(position?.ethShare ?? 0), { compact: false })}
            />
            <Stat
              label="Pooled $FANS"
              value={formatNumber(Number(position?.fansShare ?? 0), { compact: true })}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Value {formatUsd(Number(position?.valueUsd ?? 0))} · Farmers receive a share of swap fees.
          </p>
        </CardContent>
      </Card>

      {/* Add / Remove toggle */}
      <div className="inline-flex w-full rounded-[var(--radius)] border border-[var(--color-border)] p-1">
        {(['add', 'remove'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 rounded-[calc(var(--radius)-0.25rem)] py-1.5 text-sm font-medium capitalize transition-colors',
              mode === m
                ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)]'
                : 'text-[var(--color-muted)]',
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'add' ? (
        <AddForm ethAvailable={balances.eth} fansAvailable={balances.fans} />
      ) : (
        <RemoveForm shares={Number(position?.shares ?? 0)} />
      )}
    </div>
  )
}

function AddForm({ ethAvailable, fansAvailable }: { ethAvailable: number; fansAvailable: number }) {
  const [ethIn, setEthIn] = useState('')
  const [fansIn, setFansIn] = useState('')
  const { mutate, isPending, error, reset } = useAddLiquidity()

  const disabled = isPending || Number(ethIn) <= 0 || Number(fansIn) <= 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-4">
        <Field
          label="Deposit ETH"
          available={ethAvailable}
          value={ethIn}
          onChange={(v) => {
            reset()
            setEthIn(v)
          }}
        />
        <Field
          label="Deposit $FANS"
          available={fansAvailable}
          value={fansIn}
          onChange={(v) => {
            reset()
            setFansIn(v)
          }}
        />
        {error ? (
          <p className="text-xs text-[var(--color-negative)]" role="alert">
            {lpErrorMessage(error)}
          </p>
        ) : null}
        <Button
          disabled={disabled}
          onClick={() =>
            mutate(
              { ethIn, fansIn },
              {
                onSuccess: () => {
                  setEthIn('')
                  setFansIn('')
                },
              },
            )
          }
        >
          {isPending ? 'Adding…' : 'Add liquidity'}
        </Button>
      </CardContent>
    </Card>
  )
}

function RemoveForm({ shares }: { shares: number }) {
  const [amount, setAmount] = useState('')
  const { mutate, isPending, error, reset } = useRemoveLiquidity()

  const disabled = isPending || Number(amount) <= 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-4">
        <Field
          label="LP shares to remove"
          available={shares}
          value={amount}
          onChange={(v) => {
            reset()
            setAmount(v)
          }}
        />
        {error ? (
          <p className="text-xs text-[var(--color-negative)]" role="alert">
            {lpErrorMessage(error)}
          </p>
        ) : null}
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={() => mutate(amount, { onSuccess: () => setAmount('') })}
        >
          {isPending ? 'Removing…' : 'Remove liquidity'}
        </Button>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  available,
  value,
  onChange,
}: {
  label: string
  available: number
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)]">{label}</span>
        <button
          type="button"
          onClick={() => onChange(String(available))}
          className="text-xs text-[var(--color-accent)]"
        >
          {formatNumber(available, { compact: true })} Available
        </button>
      </div>
      <Input
        inputMode="decimal"
        placeholder="0.0"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
        aria-label={label}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius)] bg-[var(--color-surface-2)] p-2">
      <div className="text-[var(--color-muted)] text-xs">{label}</div>
      <div className="mt-0.5 font-semibold text-[var(--color-fg)]">{value}</div>
    </div>
  )
}
