'use client'

import { useMemo } from 'react'
import {
  useEthBalance,
  useFansBalance,
  useSwapQuote,
  useWeb3Context,
  web3Config,
} from '@/features/web3'
import { useTokenQuotes } from './use-token-quotes'
import type { WalletOverviewDto, WalletToken } from '../types'

/** 1 $FANS in wei (18 decimals) — used to quote the pool price of one token. */
const ONE_FANS = 10n ** 18n

/**
 * Builds the wallet Tokens list (ETH + $FANS) and the derived net worth.
 *
 * Balances come from the on-chain read hooks when `web3Config.enabled &&
 * isConnected`, else from the web2 sim balances on `overview`. ETH price / logo
 * / 24h come from CoinMarketCap via `useTokenQuotes(['ETH'])`. $FANS is not on
 * CMC, so its USD price is derived on the FE: `ethPriceUsd × (ETH per FANS)`
 * from the FansSwap pool quote; if that is unavailable it falls back to the
 * web2 sim `fansPriceUsd`, and finally to `null` (rendered as "—").
 */
export function useWalletTokens(overview: WalletOverviewDto | undefined) {
  const { address, isConnected } = useWeb3Context()
  const onchain = web3Config.enabled && isConnected

  const ethQuery = useEthBalance(address ?? undefined)
  const fansQuery = useFansBalance(address ?? undefined)
  const quotesQuery = useTokenQuotes(['ETH'])
  // ETH received for selling 1 $FANS → ETH-per-FANS exchange rate from the pool.
  const fansToEthQuery = useSwapQuote('fansToEth', ONE_FANS)

  return useMemo(() => {
    const ethQuote = quotesQuery.data?.find((q) => q.symbol.toUpperCase() === 'ETH')

    const ethBalance = onchain
      ? Number(ethQuery.data?.formatted ?? 0)
      : Number(overview?.balances.eth ?? 0)
    const fansBalance = onchain
      ? Number(fansQuery.data?.formatted ?? 0)
      : Number(overview?.balances.fans ?? 0)

    const ethPrice = ethQuote?.price ?? null
    const ethValue = ethPrice != null ? ethBalance * ethPrice : null

    // Derived $FANS price: ethPrice × (ETH per 1 FANS) from the pool quote.
    const ethPerFans = onchain ? Number(fansToEthQuery.data?.formatted ?? 0) : 0
    const derivedFansPrice =
      ethPrice != null && ethPerFans > 0 ? ethPrice * ethPerFans : null
    const simFansPrice = overview ? Number(overview.fansPriceUsd) : 0
    const fansPrice =
      derivedFansPrice ?? (simFansPrice > 0 ? simFansPrice : null)
    const fansValue = fansPrice != null ? fansBalance * fansPrice : null

    const tokens: WalletToken[] = [
      {
        symbol: 'ETH',
        name: ethQuote?.name ?? 'Ethereum',
        logoUrl: ethQuote?.logoUrl,
        balance: ethBalance,
        price: ethPrice,
        valueUsd: ethValue,
        change24h: ethQuote?.percentChange24h ?? null,
      },
      {
        symbol: '$FANS',
        name: 'Fans Token',
        logoUrl: undefined,
        balance: fansBalance,
        price: fansPrice,
        valueUsd: fansValue,
        change24h: null,
      },
    ]

    const netWorthUsd = tokens.reduce((sum, t) => sum + (t.valueUsd ?? 0), 0)

    return { tokens, netWorthUsd, fansPriceUsd: fansPrice, isLoading: quotesQuery.isLoading }
  }, [
    onchain,
    overview,
    ethQuery.data,
    fansQuery.data,
    fansToEthQuery.data,
    quotesQuery.data,
    quotesQuery.isLoading,
  ])
}
