'use client'

import { useRouter } from 'next/navigation'
import {
  useEthBalance,
  useFansBalance,
  useWeb3Context,
  web3Config,
} from '@/features/web3'
import { formatNumber, formatUsd } from '@/shared/lib/format'
import { useWalletKeys, useWalletOverview, useWalletRewards } from '../hooks/use-wallet'
import { AssetCard, ChangeSub, EthDiamond, TealDot, TokenValue } from './asset-card'
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

  // Live on-chain balances when the wallet is connected; fall back to web2 sim balances.
  const { address, isConnected } = useWeb3Context()
  const onchain = web3Config.enabled && isConnected
  const fansQuery = useFansBalance(address ?? undefined)
  const ethQuery = useEthBalance(address ?? undefined)

  const overview = overviewQuery.data
  const keyCount = overview?.keys.count ?? keysQuery.data?.length ?? 0

  const liveEth = onchain ? ethQuery.data : undefined
  const liveFans = onchain ? fansQuery.data : undefined

  // Swap lives on the LP page; these are navigation stubs for now.
  const goToLp = () => router.push('/lp')
  const goToChat = () => router.push('/chat')

  const ethBalance = Number(liveEth?.formatted ?? overview?.balances.eth ?? 0)
  const fansBalance = Number(liveFans?.formatted ?? overview?.balances.fans ?? 0)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6">
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
                icon="💎"
                title="Ethereum"
                subtitle="ETH"
                buttonLabel="Send/Receive"
                onButtonClick={goToLp}
              >
                <TokenValue glyph={<EthDiamond />}>{formatNumber(ethBalance)}</TokenValue>
                <ChangeSub
                  pct={liveEth ? undefined : overview.balances.ethChangePct}
                  secondary={
                    liveEth ? 'Live on-chain balance' : formatUsd(Number(overview.balances.ethUsd))
                  }
                />
              </AssetCard>

              <AssetCard
                icon="🪙"
                title="$FANS"
                subtitle="Platform Token"
                buttonLabel="Buy/Sell"
                onButtonClick={goToLp}
              >
                <TokenValue glyph={<TealDot />}>{formatNumber(fansBalance)}</TokenValue>
                <ChangeSub
                  pct={liveFans ? undefined : overview.balances.fansChangePct}
                  secondary={
                    liveFans
                      ? 'Live on-chain balance'
                      : formatUsd(Number(overview.balances.fansUsd))
                  }
                />
              </AssetCard>

              <AssetCard
                icon="🔑"
                title="Keys"
                subtitle="Creator Access"
                buttonLabel="Chat"
                onButtonClick={goToChat}
              >
                <TokenValue>{formatUsd(Number(overview.keys.valueUsd))}</TokenValue>
                <ChangeSub secondary={`${formatNumber(keyCount)} Keys`} />
              </AssetCard>
            </div>

            {rewardsQuery.data ? <RewardsCards rewards={rewardsQuery.data} /> : null}
          </>
        )}
      </div>
    </div>
  )
}
