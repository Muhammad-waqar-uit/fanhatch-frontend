'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { claimRewards, getKeys, getOverview, getRewards } from '../api/wallet.api'
import type { RewardType } from '../types'

export const walletKeys = {
  overview: ['wallet', 'overview'] as const,
  keys: ['wallet', 'keys'] as const,
  rewards: ['wallet', 'rewards'] as const,
}

/** GET /wallet/overview — headline net worth, price, balances, keys. */
export function useWalletOverview() {
  return useQuery({
    queryKey: walletKeys.overview,
    queryFn: getOverview,
  })
}

/** GET /wallet/keys — creator-access key holdings. */
export function useWalletKeys() {
  return useQuery({
    queryKey: walletKeys.keys,
    queryFn: getKeys,
  })
}

/** GET /wallet/rewards — claimable farm/club reward pools. */
export function useWalletRewards() {
  return useQuery({
    queryKey: walletKeys.rewards,
    queryFn: getRewards,
  })
}

/**
 * POST /wallet/rewards/claim. On success invalidates rewards + overview so the
 * claimed amount lands in the $FANS balance and the pools reset.
 */
export function useClaimRewards() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (type: RewardType) => claimRewards(type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.rewards })
      qc.invalidateQueries({ queryKey: walletKeys.overview })
    },
  })
}
