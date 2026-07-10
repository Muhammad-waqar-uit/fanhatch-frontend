'use client'

import { useRouter } from 'next/navigation'
import { useClaimRewards } from '../hooks/use-wallet'
import type { RewardType, WalletRewardsDto } from '../types'
import { AssetCard, EthDiamond, TealDot, TokenValue } from './asset-card'

/** Full-precision token amount (e.g. 14.00065) — no fixed 2dp rounding. */
function tokenAmount(value: string): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(Number(value))
}

/** Your Farm (staked) · Farm Rewards · Club Rewards row (figma wallet). */
export function RewardsCards({ rewards }: { rewards: WalletRewardsDto }) {
  const router = useRouter()
  const claim = useClaimRewards()

  const claiming = (type: RewardType) => claim.isPending && claim.variables === type
  const onClaim = (type: RewardType) => claim.mutate(type)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AssetCard
        icon="🏡"
        title="Your Farm"
        subtitle="Staked assets"
        buttonLabel="Add/Remove"
        onButtonClick={() => router.push('/lp')}
      >
        <TokenValue>
          <span className="flex items-center gap-2">
            <TealDot />
            {tokenAmount(rewards.stakedFans ?? '0')}
            <span className="text-[var(--color-muted)]">+</span>
            <EthDiamond />
            {tokenAmount(rewards.stakedEth ?? '0')}
          </span>
        </TokenValue>
      </AssetCard>

      <AssetCard
        icon="🧺"
        title="Farm Rewards"
        subtitle="Available to claim"
        buttonLabel={claiming('farm') ? 'Claiming…' : 'Claim'}
        onButtonClick={() => onClaim('farm')}
        buttonDisabled={claim.isPending || Number(rewards.farmRewards) <= 0}
      >
        <TokenValue glyph={<TealDot />}>{tokenAmount(rewards.farmRewards)}</TokenValue>
      </AssetCard>

      <AssetCard
        icon="🏆"
        title="Club Rewards"
        subtitle="From Creator Clubs"
        buttonLabel={claiming('club') ? 'Claiming…' : 'Claim'}
        onButtonClick={() => onClaim('club')}
        buttonDisabled={claim.isPending || Number(rewards.clubRewards) <= 0}
      >
        <TokenValue glyph={<TealDot />}>{tokenAmount(rewards.clubRewards)}</TokenValue>
      </AssetCard>
    </div>
  )
}
