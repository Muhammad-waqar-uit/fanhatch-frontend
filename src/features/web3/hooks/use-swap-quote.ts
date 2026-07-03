'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { swapQuote, type Amount, type SwapDirection } from '../reads'

/**
 * Constant-product AMM quote for `amountIn` (input-token wei) in a direction.
 * Disabled when web3 is off or `amountIn` is non-positive.
 */
export function useSwapQuote(direction: SwapDirection, amountIn = 0n) {
  const enabled = web3Config.enabled && amountIn > 0n
  return useQuery<Amount>({
    queryKey: ['web3', 'swapQuote', direction, amountIn.toString()],
    enabled,
    queryFn: () => swapQuote(direction, amountIn),
  })
}
