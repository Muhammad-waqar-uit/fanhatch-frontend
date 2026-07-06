/**
 * Market data access (CoinMarketCap-backed prices). Branches on env.useMocks:
 * returns seeded quotes for web2 dev, otherwise hits the backend Market module
 * via the shared apiClient. Mirrors the wallet.api.ts mock-branching pattern.
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import { mockTokenQuotes } from '../mocks'
import type { TokenQuote } from '../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

/**
 * GET /market/quotes?symbols=ETH,BTC → { data: TokenQuote[] }.
 * The shared apiClient interceptor unwraps the { data } envelope, so this
 * resolves to the TokenQuote[] directly. Mock branch returns seeded quotes
 * filtered to the requested symbols.
 */
export async function getTokenQuotes(symbols: string[]): Promise<TokenQuote[]> {
  if (symbols.length === 0) return []
  if (env.useMocks) {
    await delay()
    const wanted = new Set(symbols.map((s) => s.toUpperCase()))
    return mockTokenQuotes.filter((q) => wanted.has(q.symbol.toUpperCase()))
  }
  return apiClient.get('/market/quotes', {
    params: { symbols: symbols.join(',') },
  }) as unknown as Promise<TokenQuote[]>
}
