'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { fansBalance, type Amount } from '../reads'

/** $FANS ERC-20 balance of `user`. Disabled when web3 is off. */
export function useFansBalance(user?: string) {
  const enabled = web3Config.enabled && Boolean(user)
  return useQuery<Amount>({
    queryKey: ['web3', 'fansBalance', user],
    enabled,
    queryFn: () => fansBalance(user!),
  })
}
