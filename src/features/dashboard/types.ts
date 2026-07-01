/** Domain types for the Dashboard (Home feed) feature. */

export interface FeedUser {
  id: string
  name: string
  handle: string
  avatarUrl?: string
  verified?: boolean
}

/** A single point on a club's inline price sparkline. */
export interface ClubPricePoint {
  /** Sequential index / timestamp bucket. */
  t: number
  /** Price in ETH at this point. */
  price: number
}

/** Club trading snapshot rendered inside a post card. */
export interface ClubPrice {
  ticker: string
  priceEth: number
  /** 24h change, e.g. 12.45 → +12.45%. */
  changePct: number
  /** Net club trading value delta in ETH, e.g. 0.026. */
  tradingValueEth: number
  history: ClubPricePoint[]
}

export interface PostStats {
  likes: number
  comments: number
  reposts: number
  shares: number
  bookmarks: number
}

export interface Post {
  id: string
  author: FeedUser
  body: string
  createdAt: string
  stats: PostStats
  liked?: boolean
  bookmarked?: boolean
  reposted?: boolean
  /** Optional inline club price chart. */
  club?: ClubPrice
}

export type TradeSide = 'buy' | 'sell'

/** A trade-style activity row shown under the Transactions filter. */
export interface TradeActivity {
  id: string
  user: FeedUser
  side: TradeSide
  /** Number of keys traded. */
  amount: number
  ticker: string
  priceEth: number
  createdAt: string
}

export interface TrendingItem {
  id: string
  name: string
  handle: string
  ticker: string
  avatarUrl?: string
  priceEth: number
  changePct: number
}

export type FeedFilter = 'all' | 'posts' | 'transactions'

export interface FeedResponse {
  posts: Post[]
  trades: TradeActivity[]
}

export interface CreatePostInput {
  body: string
  /** Platform ids the post is cross-posted to (e.g. 'x'). */
  crossPostTo?: string[]
}

export interface ComposerDraft {
  id: string
  body: string
  updatedAt: string
}

export interface ScheduledPost {
  id: string
  body: string
  scheduledFor: string
}
