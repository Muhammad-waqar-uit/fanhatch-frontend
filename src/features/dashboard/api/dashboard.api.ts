/**
 * Dashboard data access. Branches on env.useMocks: returns local mocks for
 * web2 dev, otherwise hits the backend via the shared apiClient. Endpoint
 * paths track the backend docs (/feed, /trending, /posts).
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import { mockFeed, mockTrending } from './../mocks'
import type { CreatePostInput, FeedFilter, FeedResponse, Post, TrendingItem } from './../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function getFeed(filter: FeedFilter = 'all'): Promise<FeedResponse> {
  if (env.useMocks) {
    await delay()
    if (filter === 'posts') return { posts: mockFeed.posts, trades: [] }
    if (filter === 'transactions') return { posts: [], trades: mockFeed.trades }
    return mockFeed
  }
  return apiClient.get('/feed', { params: { filter } }) as unknown as Promise<FeedResponse>
}

export async function getTrending(): Promise<TrendingItem[]> {
  if (env.useMocks) {
    await delay(200)
    return mockTrending
  }
  return apiClient.get('/trending') as unknown as Promise<TrendingItem[]>
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  if (env.useMocks) {
    await delay(400)
    const post: Post = {
      id: `local-${crypto.randomUUID()}`,
      author: { id: 'me', name: 'You', handle: 'you', verified: false },
      body: input.body,
      createdAt: new Date().toISOString(),
      stats: { likes: 0, comments: 0, reposts: 0, shares: 0, bookmarks: 0 },
    }
    // Prepend to the shared mock feed so refetch (after invalidate) surfaces it.
    mockFeed.posts.unshift(post)
    return post
  }
  return apiClient.post('/posts', input) as unknown as Promise<Post>
}
