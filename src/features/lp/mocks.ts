/**
 * Mock state for the LP feature (served when env.useMocks is true).
 * A tiny in-memory AMM so the Swap / Liquidity / Farm flows work with no
 * backend. Constant-product with the 1.5% hook fee, matching the v4 pool.
 */
import type { Farm, LpPosition, Pool, SwapDirection } from './types'

/** Web2 price constants (see contract). */
export const ETH_PRICE_USD = 3000
export const FANS_PRICE_FALLBACK = 0.03

/**
 * Mutable pool reserves. Seeded so fansPerEth = 100,000 and the derived
 * $FANS price lands on the 0.03 fallback.
 */
export const mockPool = {
  reserveEth: 100,
  reserveFans: 10_000_000,
  totalShares: 31_622.7766,
}

/** The signed-in user's simulated wallet balances (for the "X Available" hints). */
export const mockBalances = {
  eth: 2.5,
  fans: 50_000,
}

/** The user's LP position (share of the pool). */
export const mockLpState = {
  shares: 500,
}

/** The user's farm state. */
export const mockFarm = {
  staked: 250,
  earned: 128.4,
}

/** Derived $FANS price in USD from the current pool ratio. */
export function fansPriceUsd(): number {
  if (mockPool.reserveFans === 0) return FANS_PRICE_FALLBACK
  return (mockPool.reserveEth * ETH_PRICE_USD) / mockPool.reserveFans
}

/** Constant-product output with the 1.5% hook fee: in·985·rOut / (rIn·1000 + in·985). */
export function amountOut(amountIn: number, reserveIn: number, reserveOut: number): number {
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0
  const inWithFee = amountIn * 985
  return (inWithFee * reserveOut) / (reserveIn * 1000 + inWithFee)
}

/** Price impact (%) for a swap of `amountIn` in the given direction. */
export function priceImpact(amountIn: number, direction: SwapDirection): number {
  const [reserveIn, reserveOut] =
    direction === 'eth_to_fans'
      ? [mockPool.reserveEth, mockPool.reserveFans]
      : [mockPool.reserveFans, mockPool.reserveEth]
  if (amountIn <= 0 || reserveIn <= 0) return 0
  const midPrice = reserveOut / reserveIn
  const out = amountOut(amountIn, reserveIn, reserveOut)
  const execPrice = out / amountIn
  return Math.max(0, (1 - execPrice / midPrice) * 100)
}

/** Build the Pool DTO from current mock reserves. */
export function readMockPool(): Pool {
  return {
    reserveEth: mockPool.reserveEth.toFixed(8),
    reserveFans: mockPool.reserveFans.toFixed(8),
    fansPerEth: (mockPool.reserveFans / mockPool.reserveEth).toFixed(8),
    totalShares: mockPool.totalShares.toFixed(8),
  }
}

/** Build the LpPosition DTO from current mock shares + reserves. */
export function readMockPosition(): LpPosition {
  const frac = mockPool.totalShares > 0 ? mockLpState.shares / mockPool.totalShares : 0
  const ethShare = frac * mockPool.reserveEth
  const fansShare = frac * mockPool.reserveFans
  return {
    shares: mockLpState.shares.toFixed(8),
    ethShare: ethShare.toFixed(8),
    fansShare: fansShare.toFixed(8),
    valueUsd: (ethShare * ETH_PRICE_USD + fansShare * fansPriceUsd()).toFixed(2),
  }
}

/** Build the Farm DTO from current mock farm state. */
export function readMockFarm(): Farm {
  return {
    staked: mockFarm.staked.toFixed(8),
    earned: mockFarm.earned.toFixed(8),
  }
}
