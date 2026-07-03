'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { stakeInfo, type Amount, type StakingFarm } from '../reads'

/** Staked balance + claimable rewards for `user` on a farm. Disabled when web3 is off. */
export function useStakeInfo(farm: StakingFarm, user?: string) {
  const enabled = web3Config.enabled && Boolean(user)
  return useQuery<{ staked: Amount; earned: Amount }>({
    queryKey: ['web3', 'stakeInfo', farm, user],
    enabled,
    queryFn: () => stakeInfo(farm, user!),
  })
}
