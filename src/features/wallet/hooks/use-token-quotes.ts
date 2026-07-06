'use client'

import { useQuery } from '@tanstack/react-query'
import { getTokenQuotes } from '../api/market.api'
import type { TokenQuote } from '../types'

/**
 * CoinMarketCap quotes for `symbols`. 60s staleTime keeps us within CMC rate
 * limits (the backend also caches). Disabled when there are no symbols.
 */
export function useTokenQuotes(symbols: string[]) {
  const csv = symbols.join(',')
  return useQuery<TokenQuote[]>({
    queryKey: ['market', 'quotes', csv],
    queryFn: () => getTokenQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 60_000,
  })
}
