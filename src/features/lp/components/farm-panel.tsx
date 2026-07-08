'use client'

/**
 * Farm — stake FANS-LP to earn $FANS dripped from the 1.5% trade fee, or unstake,
 * and claim accrued rewards. Staked balance + claimable are read live on-chain.
 */
import { useMemo, useState } from 'react'
import { useModal } from 'connectkit'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLpPosition, useStakeInfo, useWeb3Context, web3Config } from '@/features/web3'
import { formatNumber } from '@/shared/lib/format'
import { useClaim, useFarm, usePosition, useStake, useUnstake } from '../hooks/use-lp'
import { Segmented, StatTile, TOKENS, TokenField, num } from './token-ui'

export function FarmPanel() {
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake')
  const [amount, setAmount] = useState('')

  const { address, isConnected } = useWeb3Context()
  const web3On = web3Config.enabled
  const connected = web3On && isConnected
  const { setOpen: openWalletModal } = useModal()

  const stake = useStake()
  const unstake = useUnstake()
  const claim = useClaim()
  const active = mode === 'stake' ? stake : unstake

  // On-chain staked + claimable (LP farm) and the unstaked wallet FANS-LP balance.
  const stakeInfo = useStakeInfo('lp', connected ? address ?? undefined : undefined)
  const lpPos = useLpPosition(connected ? address ?? undefined : undefined)
  const web2Farm = useFarm()
  const web2Pos = usePosition()

  const { staked, earned, unstaked } = useMemo(() => {
    if (connected) {
      return {
        staked: num(stakeInfo.data?.staked.formatted),
        earned: num(stakeInfo.data?.earned.formatted),
        unstaked: num(lpPos.data?.shares.formatted),
      }
    }
    return {
      staked: num(web2Farm.data?.staked),
      earned: num(web2Farm.data?.earned),
      unstaked: num(web2Pos.data?.shares),
    }
  }, [connected, stakeInfo.data, lpPos.data, web2Farm.data, web2Pos.data])

  const max = mode === 'stake' ? unstaked : staked
  const over = num(amount) > max

  const cta = web3On && !connected
    ? { label: 'Connect wallet', disabled: false }
    : num(amount) <= 0
      ? { label: 'Enter an amount', disabled: true }
      : over
        ? { label: 'Insufficient FANS-LP', disabled: true }
        : active.isPending
          ? { label: mode === 'stake' ? 'Staking…' : 'Unstaking…', disabled: true }
          : { label: mode === 'stake' ? 'Stake FANS-LP' : 'Unstake FANS-LP', disabled: false }

  function onSubmit() {
    if (web3On && !connected) return openWalletModal(true)
    active.reset()
    active.mutate(amount, { onSuccess: () => setAmount('') })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Rewards */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Farm rewards</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatTile label="Staked FANS-LP" value={formatNumber(staked, { compact: true })} />
            <StatTile label="Claimable $FANS" value={formatNumber(earned, { compact: false })} accent />
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Rewards drip continuously from the 1.5% trade fee on every ETH ⇄ $FANS swap.
          </p>
          {claim.error ? (
            <p className="mt-2 text-xs text-[var(--color-negative)]" role="alert">
              {claim.error instanceof Error ? claim.error.message : 'Could not claim.'}
            </p>
          ) : null}
          <Button
            className="mt-3 w-full"
            disabled={claim.isPending || (connected && earned <= 0)}
            onClick={() => {
              if (web3On && !connected) return openWalletModal(true)
              claim.reset()
              claim.mutate()
            }}
          >
            {claim.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {web3On && !connected ? 'Connect wallet' : claim.isPending ? 'Claiming…' : 'Claim $FANS'}
          </Button>
        </CardContent>
      </Card>

      <Segmented
        options={['stake', 'unstake'] as const}
        value={mode}
        onChange={(m) => { setMode(m); setAmount(''); active.reset() }}
      />

      <Card>
        <CardContent className="flex flex-col gap-1.5 pt-4">
          <TokenField
            label={mode === 'stake' ? 'Stake' : 'Unstake'}
            token={TOKENS.lp}
            available={connected || !web3On ? max : undefined}
            value={amount}
            editable
            onChange={(v) => { active.reset(); setAmount(v) }}
            onMax={() => setAmount(String(max))}
          />
          {active.error ? (
            <p className="mt-1 text-xs text-[var(--color-negative)]" role="alert">
              {active.error instanceof Error ? active.error.message : 'Transaction failed.'}
            </p>
          ) : null}
          <Button
            className="mt-2"
            variant={mode === 'stake' ? 'primary' : 'secondary'}
            disabled={cta.disabled}
            onClick={onSubmit}
          >
            {active.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {cta.label}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
