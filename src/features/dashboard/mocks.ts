/** Mock data for the Dashboard feed (served when env.useMocks is true). */
import type {
  ClubPricePoint,
  FeedResponse,
  Post,
  TradeActivity,
  TrendingItem,
} from './types'

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

/** Build a gently trending sparkline series. */
function series(seed: number[]): ClubPricePoint[] {
  return seed.map((price, t) => ({ t, price }))
}

export const mockPosts: Post[] = [
  {
    id: 'p1',
    author: {
      id: 'u1',
      name: 'Alex Rivera',
      handle: 'alexr',
      verified: true,
    },
    body: 'gm builders. shipping the next big thing for creator clubs — early holders are going to love what is coming. 🔑',
    createdAt: minutesAgo(4),
    stats: { likes: 342, comments: 58, reposts: 41, shares: 12, bookmarks: 23 },
    liked: false,
    bookmarked: false,
    club: {
      ticker: 'ALEX',
      priceEth: 0.234,
      changePct: 12.45,
      tradingValueEth: 0.026,
      history: series([0.18, 0.19, 0.187, 0.2, 0.205, 0.21, 0.222, 0.219, 0.228, 0.234]),
    },
  },
  {
    id: 'p2',
    author: {
      id: 'u2',
      name: 'Mira Chen',
      handle: 'mirac',
      verified: true,
    },
    body: 'Club Q&A tonight at 8pm for all key holders. Drop your questions below 👇',
    createdAt: minutesAgo(27),
    stats: { likes: 128, comments: 34, reposts: 9, shares: 5, bookmarks: 14 },
    liked: true,
    bookmarked: false,
  },
  {
    id: 'p3',
    author: {
      id: 'u3',
      name: 'Devon Park',
      handle: 'devonp',
      verified: false,
    },
    body: 'Just rebalanced my club portfolio. The momentum on $MIRA keys is unreal this week.',
    createdAt: minutesAgo(63),
    stats: { likes: 76, comments: 11, reposts: 4, shares: 2, bookmarks: 6 },
    liked: false,
    bookmarked: true,
    club: {
      ticker: 'MIRA',
      priceEth: 0.512,
      changePct: -3.21,
      tradingValueEth: -0.014,
      history: series([0.55, 0.548, 0.54, 0.535, 0.52, 0.525, 0.518, 0.514, 0.51, 0.512]),
    },
  },
]

export const mockTrades: TradeActivity[] = [
  {
    id: 't1',
    user: { id: 'u4', name: 'Sasha Lee', handle: 'sashal', verified: true },
    side: 'buy',
    amount: 3,
    ticker: 'ALEX',
    priceEth: 0.234,
    createdAt: minutesAgo(2),
  },
  {
    id: 't2',
    user: { id: 'u5', name: 'Tomás Vidal', handle: 'tomasv' },
    side: 'sell',
    amount: 1,
    ticker: 'MIRA',
    priceEth: 0.512,
    createdAt: minutesAgo(9),
  },
  {
    id: 't3',
    user: { id: 'u6', name: 'Priya N', handle: 'priyan', verified: true },
    side: 'buy',
    amount: 5,
    ticker: 'DEVON',
    priceEth: 0.089,
    createdAt: minutesAgo(18),
  },
  {
    id: 't4',
    user: { id: 'u7', name: 'Kenji Watt', handle: 'kenjiw' },
    side: 'buy',
    amount: 2,
    ticker: 'ALEX',
    priceEth: 0.231,
    createdAt: minutesAgo(41),
  },
]

export const mockFeed: FeedResponse = {
  posts: mockPosts,
  trades: mockTrades,
}

export const mockTrending: TrendingItem[] = [
  { id: 'tr1', name: 'Alex Rivera', handle: 'alexr', ticker: 'ALEX', priceEth: 0.234, changePct: 12.45 },
  { id: 'tr2', name: 'Mira Chen', handle: 'mirac', ticker: 'MIRA', priceEth: 0.512, changePct: -3.21 },
  { id: 'tr3', name: 'Priya N', handle: 'priyan', ticker: 'PRIYA', priceEth: 0.176, changePct: 8.02 },
  { id: 'tr4', name: 'Kenji Watt', handle: 'kenjiw', ticker: 'KENJI', priceEth: 0.091, changePct: 4.67 },
  { id: 'tr5', name: 'Devon Park', handle: 'devonp', ticker: 'DEVON', priceEth: 0.089, changePct: -1.13 },
]

/** Build a "posted by me" mock post with sane defaults. */
function myPost(over: Partial<Post> & { id: string; body: string }): Post {
  return {
    author: { id: 'me', name: 'You', handle: 'you', verified: false },
    createdAt: new Date().toISOString(),
    stats: { likes: 0, comments: 0, reposts: 0, shares: 0, bookmarks: 0 },
    ...over,
  }
}

/**
 * Scheduled + draft posts are stored as `Post[]` (status/scheduledAt set) so the
 * mock write ops (updatePost/deletePost/publishNow) can mutate/move them exactly
 * like the real backend. These arrays are the mutable source of truth in mock mode.
 */
export const mockScheduled: Post[] = [
  myPost({
    id: 's1',
    body: 'Weekly club recap thread 🧵',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
  }),
  myPost({
    id: 's2',
    body: 'Announcing the new holder rewards',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 172_800_000).toISOString(),
  }),
]

export const mockDrafts: Post[] = [
  myPost({ id: 'd1', body: 'Some thoughts on where creator clubs go next…', status: 'draft', createdAt: minutesAgo(120) }),
]

/**
 * Replies keyed by parent post id (oldest-first, matching the backend's
 * GET /posts/:id/replies ordering). Mutable source of truth in mock mode —
 * createReply pushes here and getReplies reads from here.
 */
export const mockReplies: Record<string, Post[]> = {
  p1: [
    {
      id: 'r1',
      author: { id: 'u4', name: 'Sasha Lee', handle: 'sashal', verified: true },
      body: 'lfg 🔑 been holding since day one',
      createdAt: minutesAgo(3),
      stats: { likes: 12, comments: 1, reposts: 0, shares: 0, bookmarks: 1 },
      liked: false,
      bookmarked: false,
      reposted: false,
      parentId: 'p1',
    },
    {
      id: 'r2',
      author: { id: 'u5', name: 'Tomás Vidal', handle: 'tomasv' },
      body: 'any hints on the roadmap? 👀',
      createdAt: minutesAgo(1),
      stats: { likes: 4, comments: 0, reposts: 0, shares: 0, bookmarks: 0 },
      liked: false,
      bookmarked: false,
      reposted: false,
      parentId: 'p1',
    },
  ],
}

export const NEW_MEMBERS_COUNT = 6873
