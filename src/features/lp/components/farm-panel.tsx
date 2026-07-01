'use client'

/**
 * Farm: stake / unstake LP shares and claim earned $FANS rewards. Shows the
 * Rewards view (Balance staked, Claimable $FANS, Claim $FANS). Mutations
 * surface 400 (insufficient balance) inline.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { lpErrorMessage } from '../api/lp.api'
import { useClaim, useFarm, usePosition, useStake, useUnstake } from '../hooks/use-lp'

export function FarmPanel() {
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake')
  const [amount, setAmount] = useState('')
  const { data: farm } = useFarm()
  const { data: position } = usePosition()

  const stake = useStake()
  const unstake = useUnstake()
  const claim = useClaim()
  const active = mode === 'stake' ? stake : unstake

  const staked = Number(farm?.staked ?? 0)
  const earned = Number(farm?.earned ?? 0)
  const unstaked = Number(position?.shares ?? 0)
  const max = mode === 'stake' ? unstaked : staked

  const disabled = active.isPending || Number(amount) <= 0

  function onSubmit() {
    active.reset()
    active.mutate(amount, { onSuccess: () => setAmount('') })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Rewards */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Farm Rewards</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Stat label="Balance (staked LP)" value={formatNumber(staked)} />
            <Stat label="Claimable $FANS" value={formatNumber(earned)} accent />
          </div>
          {claim.error ? (
            <p className="mt-2 text-xs text-[var(--color-negative)]" role="alert">
              {lpErrorMessage(claim.error)}
            </p>
          ) : null}
          <Button
            className="mt-3 w-full"
            disabled={claim.isPending || earned <= 0}
            onClick={() => {
              claim.reset()
              claim.mutate()
            }}
          >
            {claim.isPending ? 'Claiming…' : 'Claim $FANS'}
          </Button>
        </CardContent>
      </Card>

      {/* Stake / Unstake */}
      <div className="inline-flex w-full rounded-[var(--radius)] border border-[var(--color-border)] p-1">
        {(['stake', 'unstake'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setAmount('')
            }}
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

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)] capitalize">{mode} LP shares</span>
            <button
              type="button"
              onClick={() => setAmount(String(max))}
              className="text-xs text-[var(--color-accent)]"
            >
              {formatNumber(max, { compact: true })} Available
            </button>
          </div>
          <Input
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => {
              active.reset()
              setAmount(e.target.value.replace(/[^0-9.]/g, ''))
            }}
            aria-label={`${mode} amount`}
          />
          {active.error ? (
            <p className="text-xs text-[var(--color-negative)]" role="alert">
              {lpErrorMessage(active.error)}
            </p>
          ) : null}
          <Button variant={mode === 'stake' ? 'primary' : 'secondary'} disabled={disabled} onClick={onSubmit}>
            {active.isPending ? 'Working…' : mode === 'stake' ? 'Stake LP' : 'Unstake LP'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[var(--radius)] bg-[var(--color-surface-2)] p-2">
      <div className="text-[var(--color-muted)] text-xs">{label}</div>
      <div
        className={cn(
          'mt-0.5 font-semibold',
          accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-fg)]',
        )}
      >
        {value}
      </div>
    </div>
  )
}
