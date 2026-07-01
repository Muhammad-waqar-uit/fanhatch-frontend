/**
 * Dashboard data access. Branches on env.useMocks: returns local mocks for
 * web2 dev, otherwise hits the backend via the shared apiClient. Endpoint
 * paths track the backend docs (/feed, /trending, /posts).
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import { mockDrafts, mockFeed, mockScheduled, mockTrending } from './../mocks'
import type {
  CreatePostInput,
  FeedFilter,
  FeedResponse,
  Post,
  PostStatus,
  TradeActivity,
  TrendingItem,
  UpdatePostInput,
} from './../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/** Result of a like/unlike toggle, mirroring the backend contract. */
export interface LikeResult {
  liked: boolean
  likes: number
}

/**
 * Normalise a backend post into the exact `Post` shape the UI expects.
 * The backend may omit optional/nullable fields (stats, liked, club…), so we
 * fill sensible defaults rather than assuming every field is present.
 */
function mapPost(raw: unknown): Post {
  const p = (raw ?? {}) as Partial<Post> & Record<string, unknown>
  const stats = (p.stats ?? {}) as Partial<Post['stats']>
  return {
    id: String(p.id ?? ''),
    author: {
      id: String(p.author?.id ?? ''),
      name: p.author?.name ?? '',
      handle: p.author?.handle ?? '',
      avatarUrl: p.author?.avatarUrl,
      verified: p.author?.verified ?? false,
    },
    body: p.body ?? '',
    createdAt: p.createdAt ?? new Date().toISOString(),
    stats: {
      likes: stats.likes ?? 0,
      comments: stats.comments ?? 0,
      reposts: stats.reposts ?? 0,
      shares: stats.shares ?? 0,
      bookmarks: stats.bookmarks ?? 0,
    },
    liked: p.liked ?? false,
    bookmarked: p.bookmarked ?? false,
    reposted: p.reposted ?? false,
    club: p.club,
    status: p.status,
    scheduledAt: p.scheduledAt,
  }
}

/** Normalise a backend trade row into the exact `TradeActivity` shape. */
function mapTrade(raw: unknown): TradeActivity {
  const t = (raw ?? {}) as Partial<TradeActivity> & Record<string, unknown>
  return {
    id: String(t.id ?? ''),
    user: {
      id: String(t.user?.id ?? ''),
      name: t.user?.name ?? '',
      handle: t.user?.handle ?? '',
      avatarUrl: t.user?.avatarUrl,
      verified: t.user?.verified ?? false,
    },
    side: t.side === 'sell' ? 'sell' : 'buy',
    amount: t.amount ?? 0,
    ticker: t.ticker ?? '',
    priceEth: t.priceEth ?? 0,
    createdAt: t.createdAt ?? new Date().toISOString(),
  }
}

export async function getFeed(filter: FeedFilter = 'all'): Promise<FeedResponse> {
  if (env.useMocks) {
    await delay()
    if (filter === 'posts') return { posts: mockFeed.posts, trades: [] }
    if (filter === 'transactions') return { posts: [], trades: mockFeed.trades }
    return mockFeed
  }
  const res = (await apiClient.get('/feed', { params: { filter } })) as unknown as {
    posts?: unknown[]
    trades?: unknown[]
  }
  return {
    posts: (res?.posts ?? []).map(mapPost),
    trades: (res?.trades ?? []).map(mapTrade),
  }
}

export async function getTrending(): Promise<TrendingItem[]> {
  if (env.useMocks) {
    await delay(200)
    return mockTrending
  }
  return apiClient.get('/trending') as unknown as Promise<TrendingItem[]>
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const status: PostStatus = input.status ?? 'published'
  if (env.useMocks) {
    await delay(400)
    const post: Post = {
      id: `local-${crypto.randomUUID()}`,
      author: { id: 'me', name: 'You', handle: 'you', verified: false },
      body: input.body,
      createdAt: new Date().toISOString(),
      stats: { likes: 0, comments: 0, reposts: 0, shares: 0, bookmarks: 0 },
      status,
      scheduledAt: input.scheduledAt,
    }
    // Route into the shared mock list matching status so the right tab refetch surfaces it.
    if (status === 'scheduled') mockScheduled.unshift(post)
    else if (status === 'draft') mockDrafts.unshift(post)
    else mockFeed.posts.unshift(post)
    return post
  }
  // Map the composer's `crossPostTo` field onto the backend's `crossPostTargets` key.
  const raw = await apiClient.post('/posts', {
    body: input.body,
    status: input.status,
    scheduledAt: input.scheduledAt,
    crossPostTargets: input.crossPostTo,
  })
  return mapPost(raw)
}

/**
 * List the current user's posts by status. Real: GET /posts/me?status=.
 * Reads the response defensively (bare array or `{ items }`). Mock → the shared
 * mock list for that status, mapped through mapPost.
 */
export async function getMyPosts(status: PostStatus): Promise<Post[]> {
  if (env.useMocks) {
    await delay(200)
    const src =
      status === 'scheduled' ? mockScheduled : status === 'draft' ? mockDrafts : mockFeed.posts
    return src.map(mapPost)
  }
  const res = (await apiClient.get('/posts/me', { params: { status } })) as unknown
  const items = Array.isArray(res) ? res : ((res as { items?: unknown[] })?.items ?? [])
  return items.map(mapPost)
}

/** Locate a mock post across all lists and remove it, returning it. */
function takeMockPost(id: string): Post | undefined {
  for (const list of [mockScheduled, mockDrafts, mockFeed.posts]) {
    const idx = list.findIndex((p) => p.id === id)
    if (idx !== -1) return list.splice(idx, 1)[0]
  }
  return undefined
}

/** Insert a mock post into the list matching its status. */
function placeMockPost(post: Post): void {
  if (post.status === 'scheduled') mockScheduled.unshift(post)
  else if (post.status === 'draft') mockDrafts.unshift(post)
  else mockFeed.posts.unshift(post)
}

/** Edit/reschedule/cancel a post. Real: PATCH /posts/:id → post. */
export async function updatePost(id: string, patch: UpdatePostInput): Promise<Post> {
  if (env.useMocks) {
    await delay(200)
    const existing = takeMockPost(id)
    const updated: Post = {
      ...(existing ?? {
        id,
        author: { id: 'me', name: 'You', handle: 'you', verified: false },
        body: '',
        createdAt: new Date().toISOString(),
        stats: { likes: 0, comments: 0, reposts: 0, shares: 0, bookmarks: 0 },
        status: 'draft',
      }),
      ...patch,
    }
    placeMockPost(updated)
    return mapPost(updated)
  }
  const raw = await apiClient.patch(`/posts/${id}`, patch)
  return mapPost(raw)
}

/** Delete a post. Real: DELETE /posts/:id. */
export async function deletePost(id: string): Promise<void> {
  if (env.useMocks) {
    await delay(200)
    takeMockPost(id)
    return
  }
  await apiClient.delete(`/posts/${id}`)
}

/** Force-publish a scheduled/draft post now. Real: POST /posts/:id/publish → post. */
export async function publishNow(id: string): Promise<Post> {
  if (env.useMocks) {
    await delay(200)
    const existing = takeMockPost(id)
    const published: Post = {
      ...(existing ?? {
        id,
        author: { id: 'me', name: 'You', handle: 'you', verified: false },
        body: '',
        stats: { likes: 0, comments: 0, reposts: 0, shares: 0, bookmarks: 0 },
      }),
      status: 'published',
      scheduledAt: undefined,
      createdAt: new Date().toISOString(),
    }
    mockFeed.posts.unshift(published)
    return mapPost(published)
  }
  const raw = await apiClient.post(`/posts/${id}/publish`)
  return mapPost(raw)
}

/** Like a post. Real: POST /posts/:id/like → { liked, likes }. */
export async function likePost(id: string): Promise<LikeResult> {
  if (env.useMocks) {
    await delay(150)
    const post = mockFeed.posts.find((p) => p.id === id)
    if (post && !post.liked) {
      post.liked = true
      post.stats.likes += 1
    }
    return { liked: true, likes: post?.stats.likes ?? 0 }
  }
  return apiClient.post(`/posts/${id}/like`) as unknown as Promise<LikeResult>
}

/** Unlike a post. Real: DELETE /posts/:id/like → { liked, likes }. */
export async function unlikePost(id: string): Promise<LikeResult> {
  if (env.useMocks) {
    await delay(150)
    const post = mockFeed.posts.find((p) => p.id === id)
    if (post && post.liked) {
      post.liked = false
      post.stats.likes = Math.max(0, post.stats.likes - 1)
    }
    return { liked: false, likes: post?.stats.likes ?? 0 }
  }
  return apiClient.delete(`/posts/${id}/like`) as unknown as Promise<LikeResult>
}
