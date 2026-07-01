'use client'

import { Coins, Gift, MinusCircle, PlusCircle, Sprout } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatNumber, formatUsd } from '@/shared/lib/format'
import { useClaimRewards } from '../hooks/use-wallet'
import type { RewardType, WalletRewardsDto } from '../types'

/** A single reward tile with a headline value and one action row. */
function RewardCard({
  icon: Icon,
  title,
  subtitle,
  value,
  children,
}: {
  icon: typeof Sprout
  title: string
  subtitle: string
  value: string
  children: React.ReactNode
}) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-accent)]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{title}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
        </div>
      </div>
      <p className="text-xl font-semibold text-[var(--color-fg)]">{value}</p>
      <div className="mt-auto flex flex-wrap gap-2">{children}</div>
    </Card>
  )
}

/** Amount of a $FANS reward pool as a "N $FANS" label. */
const fans = (amount: string) => `${formatNumber(Number(amount))} $FANS`

/** Your Farm (staked) · Farm Rewards · Club Rewards row (figma wallet). */
export function RewardsCards({ rewards }: { rewards: WalletRewardsDto }) {
  const router = useRouter()
  const claim = useClaimRewards()

  const claiming = (type: RewardType) => claim.isPending && claim.variables === type

  const onClaim = (type: RewardType) => claim.mutate(type)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <RewardCard
        icon={Sprout}
        title="Your Farm"
        subtitle="Staked assets"
        value={rewards.stakedUsd ? formatUsd(Number(rewards.stakedUsd)) : '—'}
      >
        <Button variant="secondary" size="sm" onClick={() => router.push('/lp')}>
          <PlusCircle />
          Add
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/lp')}>
          <MinusCircle />
          Remove
        </Button>
      </RewardCard>

      <RewardCard
        icon={Coins}
        title="Farm Rewards"
        subtitle="Available to claim"
        value={fans(rewards.farmRewards)}
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => onClaim('farm')}
          disabled={claim.isPending || Number(rewards.farmRewards) <= 0}
        >
          <Gift />
          {claiming('farm') ? 'Claiming…' : 'Claim'}
        </Button>
      </RewardCard>

      <RewardCard
        icon={Gift}
        title="Club Rewards"
        subtitle="From Creator Clubs"
        value={fans(rewards.clubRewards)}
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => onClaim('club')}
          disabled={claim.isPending || Number(rewards.clubRewards) <= 0}
        >
          <Gift />
          {claiming('club') ? 'Claiming…' : 'Claim'}
        </Button>
      </RewardCard>
    </div>
  )
}
