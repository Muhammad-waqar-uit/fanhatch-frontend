/**
 * Domain types for the LP feature (liquidity + farm + swap).
 * Mirrors the web2 API contract (mock v4 pool + StakingManager).
 * All on-chain-style amounts are decimal strings.
 */

/** Which side of the pool a swap moves. */
export type SwapDirection = 'eth_to_fans' | 'fans_to_eth'

/** The AMM pool singleton (constant-product, 1.5% fee). GET /lp/pool. */
export interface Pool {
  reserveEth: string
  reserveFans: string
  /** Spot price: reserveFans / reserveEth. */
  fansPerEth: string
  totalShares: string
}

/** The caller's liquidity position. GET /lp/position. */
export interface LpPosition {
  shares: string
  /** ETH the shares are worth if withdrawn now. */
  ethShare: string
  /** $FANS the shares are worth if withdrawn now. */
  fansShare: string
  valueUsd: string
}

/** The caller's farm (staked LP shares + claimable $FANS). GET /lp/farm. */
export interface Farm {
  staked: string
  /** Claimable rewards, denominated in $FANS. */
  earned: string
}

/** Payload for POST /lp/quote. */
export interface QuoteInput {
  action: 'swap' | 'add'
  direction?: SwapDirection
  ethIn?: string
  fansIn?: string
  amountIn?: string
}

/** Result of POST /lp/quote. */
export interface SwapQuote {
  /** Tokens out for a swap quote. */
  amountOut?: string
  /** LP shares minted for an add-liquidity quote. */
  sharesOut?: string
  priceImpactPct?: number
}

/** Result of POST /lp/add. */
export interface AddLiquidityResult {
  shares: string
  position: LpPosition
}

/** Result of POST /lp/remove. */
export interface RemoveLiquidityResult {
  ethOut: string
  fansOut: string
}

/** Result of POST /lp/swap. */
export interface SwapResult {
  amountOut: string
  pool: Pool
}

/** Result of POST /lp/farm/claim. */
export interface ClaimResult {
  claimed: string
  fansBalance: string
}
