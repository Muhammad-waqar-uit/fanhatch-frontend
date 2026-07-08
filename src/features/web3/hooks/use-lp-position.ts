'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { lpPosition, type Amount } from '../reads'

type LpPosition = {
  shares: Amount
  totalShares: Amount
  ethReserve: Amount
  fansReserve: Amount
  ethShare: Amount
  fansShare: Amount
}

/**
 * A user's on-chain FANS-LP vault position (shares + redeemable ETH/$FANS).
 * Disabled when web3 is off or no user is connected.
 */
export function useLpPosition(user?: string) {
  const enabled = web3Config.enabled && Boolean(user)
  return useQuery<LpPosition>({
    queryKey: ['web3', 'lpPosition', user],
    enabled,
    queryFn: () => lpPosition(user!),
  })
}
