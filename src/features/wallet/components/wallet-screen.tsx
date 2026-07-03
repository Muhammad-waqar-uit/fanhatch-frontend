'use client'

import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  KeyRound,
  MessageCircle,
  ShoppingCart,
  Tag,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatNumber, formatUsd } from '@/shared/lib/format'
import { useWalletKeys, useWalletOverview, useWalletRewards } from '../hooks/use-wallet'
import { AssetCard } from './asset-card'
import { NetWorthHeader } from './net-worth-header'
import { RewardsCards } from './rewards-cards'
import { WalletAddressCard } from './wallet-address-card'

/**
 * Wallet screen (web2). Header (Net Worth + $FANS Price), an asset cards row
 * (ETH / $FANS / Keys), and a rewards cards row (Your Farm / Farm Rewards /
 * Club Rewards). Works in mock mode with no backend. Send/Receive/Buy/Sell
 * route to LP (where the swap lives); a key's Chat button opens /chat.
 */
export function WalletScreen() {
  const router = useRouter()
  const overviewQuery = useWalletOverview()
  const keysQuery = useWalletKeys()
  const rewardsQuery = useWalletRewards()

  const overview = overviewQuery.data
  const keyCount = overview?.keys.count ?? keysQuery.data?.length ?? 0

  // Swap lives on the LP page; these are navigation stubs for now.
  const goToLp = () => router.push('/lp')
  const goToChat = () => router.push('/chat')

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6">
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">Wallet</h1>

        <WalletAddressCard />

        {overviewQuery.isLoading ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">Loading wallet…</p>
        ) : overviewQuery.isError || !overview ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">
            Could not load your wallet.
          </p>
        ) : (
          <>
            <NetWorthHeader overview={overview} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AssetCard
                icon={Coins}
                title="Ethereum"
                subtitle="ETH"
                value={`${formatNumber(Number(overview.balances.eth))} ETH`}
                secondary={formatUsd(Number(overview.balances.ethUsd))}
                actions={[
                  { label: 'Send', onClick: goToLp, icon: ArrowUpRight },
                  { label: 'Receive', onClick: goToLp, variant: 'outline', icon: ArrowDownLeft },
                ]}
              />

              <AssetCard
                icon={Coins}
                title="$FANS"
                subtitle="Platform Token"
                value={`${formatNumber(Number(overview.balances.fans))} $FANS`}
                secondary={formatUsd(Number(overview.balances.fansUsd))}
                actions={[
                  { label: 'Buy', onClick: goToLp, variant: 'primary', icon: ShoppingCart },
                  { label: 'Sell', onClick: goToLp, variant: 'outline', icon: Tag },
                ]}
              />

              <AssetCard
                icon={KeyRound}
                title="Keys"
                subtitle="Creator Access"
                value={formatUsd(Number(overview.keys.valueUsd))}
                secondary={`${formatNumber(keyCount)} Keys`}
                actions={[
                  { label: 'Chat', onClick: goToChat, icon: MessageCircle },
                ]}
              />
            </div>

            {rewardsQuery.data ? <RewardsCards rewards={rewardsQuery.data} /> : null}
          </>
        )}
      </div>
    </div>
  )
}
