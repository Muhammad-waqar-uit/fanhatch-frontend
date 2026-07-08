'use client'

import { useQuery } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { web3Config } from '../config'
import { currentGasPrice } from '../reads'

/**
 * Rough network-fee estimate for a v4 swap: `gasPrice × gasUnits`, as an ETH string.
 * This is an estimate for display; MetaMask shows the exact fee at signing time.
 */
export function useNetworkFee(gasUnits = 220_000n) {
  const q = useQuery({
    queryKey: ['web3', 'gasPrice'],
    enabled: web3Config.enabled,
    refetchInterval: 15_000,
    queryFn: currentGasPrice,
  })
  const gasPrice = q.data ?? 0n
  return { feeEth: gasPrice > 0n ? formatEther(gasPrice * gasUnits) : null, isLoading: q.isLoading }
}
