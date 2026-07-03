'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { keyBalance, type Amount } from '../reads'

/** Key balance a `user` holds of a given ClubKey. Disabled when web3 is off. */
export function useKeyBalance(clubKey?: string, user?: string) {
  const enabled = web3Config.enabled && Boolean(clubKey) && Boolean(user)
  return useQuery<Amount>({
    queryKey: ['web3', 'keyBalance', clubKey, user],
    enabled,
    queryFn: () => keyBalance(clubKey!, user!),
  })
}
