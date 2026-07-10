/**
 * Bookmarks data access. Branches on env.useMocks: returns local mocks for
 * web2 dev, otherwise hits the backend via the shared apiClient. Endpoint path
 * tracks the backend contract (GET /bookmarks, JWT required).
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import type { Post } from '@/features/dashboard/types'
import { mockBookmarks } from '@/features/profile/mocks'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

/** A bare paginated list envelope as returned by the backend. */
interface Page<T> {
  items: T[]
  meta?: unknown
}

/** GET /bookmarks — the caller's bookmarked posts, newest-bookmarked first. */
export async function getBookmarks(): Promise<Post[]> {
  if (env.useMocks) {
    await delay()
    return [...mockBookmarks]
  }
  const page = (await apiClient.get('/bookmarks')) as unknown as Page<Post>
  return page.items
}
