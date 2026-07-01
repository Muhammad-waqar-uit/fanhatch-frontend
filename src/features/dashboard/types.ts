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

/** Lifecycle status of a post (see docs/02-home/post-features-and-scheduling.md). */
export type PostStatus = 'draft' | 'scheduled' | 'published'

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
  /** Lifecycle status; absent means published (legacy feed posts). */
  status?: PostStatus
  /** ISO time a scheduled post should publish. */
  scheduledAt?: string
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
  /** Publish now (default) or save as draft / schedule. */
  status?: PostStatus
  /** ISO time to publish at when status is 'scheduled'. */
  scheduledAt?: string
  /**
   * Platform ids the post is cross-posted to (e.g. 'x'). This is the composer's
   * field name; the API maps it to the backend's `crossPostTargets` key.
   */
  crossPostTo?: string[]
}

/** Fields patchable on an existing post via PATCH /posts/:id. */
export interface UpdatePostInput {
  body?: string
  scheduledAt?: string
  status?: PostStatus
}
