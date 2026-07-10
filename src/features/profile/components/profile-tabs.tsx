'use client'

import { PostCard } from '@/features/dashboard/components/post-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { timeAgo } from '@/shared/lib/format'
import {
  useActivity,
  useClubs,
  useFollowers,
  useFollowing,
  useHolders,
  useHolding,
  useUserLikes,
  useUserPosts,
  useUserReplies,
} from '../hooks/use-profile-tabs'
import type { ActivityDto, ProfileDto, ProfileTab } from '../types'
import { ClubCard } from './club-card'
import { UserCard } from './user-card'

const TAB_LABELS: { value: ProfileTab; label: string }[] = [
  { value: 'clubs', label: 'Clubs' },
  { value: 'activity', label: 'Activity' },
  { value: 'holders', label: 'Holders' },
  { value: 'holding', label: 'Holding' },
  { value: 'followers', label: 'Followers' },
  { value: 'following', label: 'Following' },
  { value: 'posts', label: 'Posts' },
  { value: 'replies', label: 'Replies' },
  { value: 'likes', label: 'Likes' },
]

/** Shared loading / empty scaffolding for a tab body. */
function TabState({
  isLoading,
  isEmpty,
  emptyText,
  children,
}: {
  isLoading: boolean
  isEmpty: boolean
  emptyText: string
  children: React.ReactNode
}) {
  if (isLoading) {
    return <p className="px-2 py-6 text-sm text-[var(--color-muted)]">Loading…</p>
  }
  if (isEmpty) {
    return <p className="px-2 py-6 text-sm text-[var(--color-muted)]">{emptyText}</p>
  }
  return <>{children}</>
}

function ActivityRow({ item }: { item: ActivityDto }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[var(--radius)] px-2 py-2 hover:bg-[var(--color-surface-2)]">
      <p className="text-sm text-[var(--color-fg)]">{item.summary}</p>
      <span className="shrink-0 text-xs text-[var(--color-muted)]">{timeAgo(item.ts)}</span>
    </div>
  )
}

/**
 * The six profile tabs (Clubs · Activity · Holders · Holding · Followers ·
 * Following). Controlled so the stat tiles can drive tab selection. Each tab's
 * data loads lazily (only when it's the active tab).
 */
export function ProfileTabs({
  profile,
  value,
  onValueChange,
}: {
  profile: ProfileDto
  value: ProfileTab
  onValueChange: (tab: ProfileTab) => void
}) {
  const id = profile.id
  const posts = useUserPosts(id, value === 'posts')
  const replies = useUserReplies(id, value === 'replies')
  const likes = useUserLikes(id, value === 'likes')
  const clubs = useClubs(id, value === 'clubs')
  const activity = useActivity(id, value === 'activity')
  const holders = useHolders(id, value === 'holders')
  const holding = useHolding(id, value === 'holding')
  const followers = useFollowers(id, value === 'followers')
  const following = useFollowing(id, value === 'following')

  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ProfileTab)}>
      <TabsList className="w-full overflow-x-auto">
        {TAB_LABELS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-3">
        <TabsContent value="posts">
          <TabState isLoading={posts.isLoading} isEmpty={!posts.data?.length} emptyText="No posts yet.">
            <div className="flex flex-col gap-3">
              {posts.data?.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="replies">
          <TabState
            isLoading={replies.isLoading}
            isEmpty={!replies.data?.length}
            emptyText="No replies yet."
          >
            <div className="flex flex-col gap-3">
              {replies.data?.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="likes">
          <TabState isLoading={likes.isLoading} isEmpty={!likes.data?.length} emptyText="No likes yet.">
            <div className="flex flex-col gap-3">
              {likes.data?.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="clubs">
          <TabState isLoading={clubs.isLoading} isEmpty={!clubs.data?.length} emptyText="No clubs yet.">
            <div className="flex flex-col">
              {clubs.data?.map((club) => <ClubCard key={club.id} club={club} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="activity">
          <TabState
            isLoading={activity.isLoading}
            isEmpty={!activity.data?.length}
            emptyText="No activity yet."
          >
            <div className="flex flex-col">
              {activity.data?.map((item) => <ActivityRow key={item.id} item={item} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="holders">
          <TabState
            isLoading={holders.isLoading}
            isEmpty={!holders.data?.length}
            emptyText="No holders yet."
          >
            <div className="flex flex-col">
              {holders.data?.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="holding">
          <TabState
            isLoading={holding.isLoading}
            isEmpty={!holding.data?.length}
            emptyText="Not holding any keys."
          >
            <div className="flex flex-col">
              {holding.data?.map((club) => <ClubCard key={club.id} club={club} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="followers">
          <TabState
            isLoading={followers.isLoading}
            isEmpty={!followers.data?.length}
            emptyText="No followers yet."
          >
            <div className="flex flex-col">
              {followers.data?.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
          </TabState>
        </TabsContent>

        <TabsContent value="following">
          <TabState
            isLoading={following.isLoading}
            isEmpty={!following.data?.length}
            emptyText="Not following anyone yet."
          >
            <div className="flex flex-col">
              {following.data?.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
          </TabState>
        </TabsContent>
      </div>
    </Tabs>
  )
}
