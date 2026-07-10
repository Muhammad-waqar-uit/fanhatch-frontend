/** Domain types for the Wallet feature (see docs web2 contract — Wallet section). */

/** Reward pool a user can claim from. */
export type RewardType = 'farm' | 'club'

/** GET /wallet/overview — headline balances + prices for the wallet screen. */
export interface WalletOverviewDto {
  /** Total net worth in USD, decimal string. */
  netWorthUsd: string
  /** 24h net-worth change as a percentage, e.g. -13 → -13%. */
  change24hPct: number
  /** Current $FANS price in USD, decimal string (pool-derived, fallback 0.03). */
  fansPriceUsd: string
  balances: {
    eth: string
    ethUsd: string
    /** 24h ETH price change as a percentage (FE display; backend may omit). */
    ethChangePct?: number
    fans: string
    fansUsd: string
    /** 24h $FANS price change as a percentage (FE display; backend may omit). */
    fansChangePct?: number
  }
  keys: {
    count: number
    valueUsd: string
  }
  /** Rewards available to claim, decimal $FANS strings. */
  rewards: {
    farm: string
    club: string
  }
}

/** GET /wallet/keys — one row per creator club the viewer holds keys in. */
export interface KeyHoldingDto {
  clubId: string
  ftId: string
  name: string
  ticker: string
  keyCount: number
  /** Current key price, decimal $FANS string. */
  keyPrice: string
  /** keyCount * keyPrice in USD, decimal string. */
  valueUsd: string
}

/**
 * GET /wallet/rewards — claimable reward pools.
 * `stakedUsd` is a frontend-tolerated extension used for the "Your Farm"
 * (staked assets) card; the backend may omit it (real mode falls back to "0").
 */
export interface WalletRewardsDto {
  farmRewards: string
  clubRewards: string
  claimable: string
  stakedUsd?: string
  /** Staked $FANS amount for the "Your Farm" card (FE tolerated; backend may omit). */
  stakedFans?: string
  /** Staked ETH amount for the "Your Farm" card (FE tolerated; backend may omit). */
  stakedEth?: string
}

/** POST /wallet/rewards/claim — result of claiming a reward pool. */
export interface ClaimRewardsResultDto {
  /** Amount moved into the wallet, decimal $FANS string. */
  claimed: string
  /** New $FANS balance after the claim, decimal string. */
  fansBalance: string
}

/**
 * View model for a single token row in the wallet Tokens list. Balance-only
 * (no fiat pricing) — ETH + $FANS sourced from on-chain reads / web2 sim balances.
 */
export interface WalletToken {
  symbol: string
  name: string
  /** Wallet balance in whole token units. */
  balance: number
}
