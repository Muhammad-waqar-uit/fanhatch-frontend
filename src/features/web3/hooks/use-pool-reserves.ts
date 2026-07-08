'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { poolReserves } from '../reads'

/** Live ETH/$FANS reserves of the v4 pool (the vault's position). Polls every 15s. */
export function usePoolReserves() {
  return useQuery({
    queryKey: ['web3', 'poolReserves'],
    enabled: web3Config.enabled,
    refetchInterval: 15_000,
    queryFn: poolReserves,
  })
}
