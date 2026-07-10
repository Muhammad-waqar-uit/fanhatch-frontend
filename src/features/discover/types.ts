/** Domain types for the Discover (explore) feature. UI-only / mock-backed. */

/** A single point on a club's price sparkline. */
export interface SparkPoint {
  /** Sequential index / time bucket. */
  t: number
  /** Price in ETH at this point. */
  price: number
}

/** A trending club shown in the Discover grid. */
export interface DiscoverClub {
  id: string
  /** Display name of the club/creator. */
  name: string
  /** Trading ticker, rendered as $TICKER. */
  ticker: string
  /** Friend.tech-style club id, rendered as FT#123. */
  clubNo: number
  avatarUrl?: string
  verified?: boolean
  /** Current key price in ETH. */
  priceEth: number
  /** 24h change, e.g. 12.45 → +12.45%. */
  changePct: number
  /** Number of key holders. */
  holders: number
  /** Recent price history for the sparkline. */
  history: SparkPoint[]
}

/** A suggested creator shown in the Discover creators section. */
export interface DiscoverCreator {
  id: string
  name: string
  handle: string
  avatarUrl?: string
  verified?: boolean
  /** Short one-line bio. */
  bio: string
  /** Follower count. */
  followers: number
}

/** Filter chip ids for the Discover toolbar. */
export type DiscoverFilter = 'trending' | 'new' | 'top-clubs' | 'creators'
