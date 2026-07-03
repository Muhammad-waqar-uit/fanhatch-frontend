'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { keyBuyPrice, keySellPrice, type Amount } from '../reads'

/**
 * Buy + sell price (in $FANS) for `amount` keys of a resolved ClubKey address.
 * Disabled when web3 is off or inputs are missing.
 */
export function useKeyPrice(clubKey?: string, amount = 1n) {
  const enabled = web3Config.enabled && Boolean(clubKey) && amount > 0n
  return useQuery<{ buy: Amount; sell: Amount }>({
    queryKey: ['web3', 'keyPrice', clubKey, amount.toString()],
    enabled,
    queryFn: async () => {
      const [buy, sell] = await Promise.all([
        keyBuyPrice(clubKey!, amount),
        keySellPrice(clubKey!, amount),
      ])
      return { buy, sell }
    },
  })
}
