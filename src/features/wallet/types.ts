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
    fans: string
    fansUsd: string
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
}

/** POST /wallet/rewards/claim — result of claiming a reward pool. */
export interface ClaimRewardsResultDto {
  /** Amount moved into the wallet, decimal $FANS string. */
  claimed: string
  /** New $FANS balance after the claim, decimal string. */
  fansBalance: string
}

/**
 * GET /market/quotes?symbols=ETH,BTC → { data: TokenQuote[] }.
 * CoinMarketCap-backed price snapshot for one token symbol.
 */
export interface TokenQuote {
  symbol: string
  name: string
  /** Spot price in USD. */
  price: number
  /** 24h price change as a percentage, e.g. -2.4 → -2.4%. */
  percentChange24h: number
  /** Market cap in USD. */
  marketCap: number
  /** Token logo URL (CMC static asset), when available. */
  logoUrl?: string
}

/**
 * View model for a single token row in the wallet Tokens list. Prices/values
 * are nullable so tokens without a known USD price (e.g. $FANS when the pool
 * quote is unavailable) render a "—" placeholder instead of a bogus number.
 */
export interface WalletToken {
  symbol: string
  name: string
  logoUrl?: string
  /** Wallet balance in whole token units. */
  balance: number
  /** USD price per token, or null when unknown. */
  price: number | null
  /** balance × price in USD, or null when the price is unknown. */
  valueUsd: number | null
  /** 24h change %, or null when no quote is available. */
  change24h: number | null
}
