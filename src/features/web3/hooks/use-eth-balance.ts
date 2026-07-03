'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { ethBalance, type Amount } from '../reads'

/** Native ETH balance of `user`. Disabled when web3 is off. */
export function useEthBalance(user?: string) {
  const enabled = web3Config.enabled && Boolean(user)
  return useQuery<Amount>({
    queryKey: ['web3', 'ethBalance', user],
    enabled,
    queryFn: () => ethBalance(user!),
  })
}
