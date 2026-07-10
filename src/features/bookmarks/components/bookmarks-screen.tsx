'use client'

import { Bookmark } from 'lucide-react'
import { PostCard } from '@/features/dashboard/components/post-card'
import { Card, CardContent } from '@/components/ui/card'
import { useBookmarks } from '../hooks/use-bookmarks'

/** Post-card shaped loading skeleton, mirroring the feed's loading state. */
function BookmarksSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="size-9 shrink-0 animate-pulse rounded-full bg-[var(--color-surface-2)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
                <div className="h-3 w-full animate-pulse rounded bg-[var(--color-surface-2)]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Bookmarks screen. Lists the signed-in user's saved posts, newest-bookmarked
 * first. Works in mock mode with no backend.
 */
export function BookmarksScreen() {
  const { data, isLoading, isError } = useBookmarks()
  const posts = data ?? []

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
        <div className="flex items-center gap-2">
          <Bookmark className="size-5 text-[var(--color-accent)]" />
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">Bookmarks</h1>
        </div>

        {isLoading ? (
          <BookmarksSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-[var(--color-muted)]">
              Couldn&apos;t load your bookmarks. Please try again.
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-[var(--color-muted)]">
              You haven&apos;t bookmarked anything yet.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
