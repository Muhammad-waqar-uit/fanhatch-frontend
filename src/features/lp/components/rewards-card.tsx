'use client'

/**
 * "Your LP" card — the LP rewards summary and claim action. Mirrors the Figma
 * left column: Balance / LP Bonus rows, a large Claimable readout, and Claim $FANS.
 * Staked balance + claimable $FANS are read live on-chain (falling back to the
 * web2 mock/API when a wallet isn't driving the UI).
 */
import { useModal } from 'connectkit'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStakeInfo, useWeb3Context, web3Config } from '@/features/web3'
import { formatNumber } from '@/shared/lib/format'
import { useClaim, useFarm } from '../hooks/use-lp'
import { KeyValueRow, TOKENS, num } from './token-ui'

export function RewardsCard() {
  const { address, isConnected } = useWeb3Context()
  const web3On = web3Config.enabled
  const connected = web3On && isConnected
  const { setOpen: openWalletModal } = useModal()

  const claim = useClaim()
  const stakeInfo = useStakeInfo('lp', connected ? address ?? undefined : undefined)
  const web2Farm = useFarm()

  const { staked, earned } = useMemo(() => {
    if (connected) {
      return {
        staked: num(stakeInfo.data?.staked.formatted),
        earned: num(stakeInfo.data?.earned.formatted),
      }
    }
    return {
      staked: num(web2Farm.data?.staked),
      earned: num(web2Farm.data?.earned),
    }
  }, [connected, stakeInfo.data, web2Farm.data])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5">
        <h2 className="text-lg font-bold text-[var(--color-fg)]">Your LP</h2>

        <div className="flex flex-col gap-2">
          <KeyValueRow label="Balance">{formatNumber(staked, { compact: true })} FANS-LP</KeyValueRow>
          <KeyValueRow label="LP Bonus">
            <span className="text-[var(--color-accent)]">$FANS</span>
            <span className="text-[var(--color-muted)]"> and </span>
            <span
              className="inline-flex items-center gap-1 align-middle"
              style={{ color: TOKENS.eth.dot }}
            >
              ETH
            </span>
          </KeyValueRow>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] py-8">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: TOKENS.fans.dot }} />
            <span className="text-2xl font-bold text-[var(--color-fg)]">
              {formatNumber(earned, { compact: false })}
            </span>
          </div>
          <span className="text-sm text-[var(--color-muted)]">Claimable $FANS</span>
        </div>

        {claim.error ? (
          <p className="text-xs text-[var(--color-negative)]" role="alert">
            {claim.error instanceof Error ? claim.error.message : 'Could not claim.'}
          </p>
        ) : null}

        <Button
          className="w-full"
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
  )
}
