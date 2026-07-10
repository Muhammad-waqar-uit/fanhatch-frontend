'use client'

import { BadgeCheck, Check, Gem, HandCoins, Heart, MessageCircle, MoreHorizontal, Repeat2, Share } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type MouseEvent, useState } from 'react'
import { env } from '@/config/env'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'
import { formatNumber, timeAgo } from '@/shared/lib/format'
import {
  bookmarkPost,
  likePost,
  repost,
  unbookmarkPost,
  unlikePost,
  unrepost,
} from '../api/dashboard.api'
import type { Post } from '../types'
import { PriceChartInline } from './price-chart-inline'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface ActionProps {
  icon: typeof Heart
  count: number
  active?: boolean
  activeClass?: string
  label: string
  onClick?: () => void
}

function Action({ icon: Icon, count, active, activeClass, label, onClick }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        'group flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]',
        active && activeClass,
      )}
    >
      <Icon className={cn('size-4', active && 'fill-current')} />
      <span className="tabular-nums">{formatNumber(count, { compact: true })}</span>
    </button>
  )
}

/**
 * A single post. When `detail` is false (default) the card is clickable and
 * navigates to the post's thread; the action row stops propagation so button
 * clicks never trigger card navigation. Pass `detail` for the focused view.
 */
export function PostCard({ post, detail = false }: { post: Post; detail?: boolean }) {
  const router = useRouter()
  const href = `/post/${post.id}`

  const [liked, setLiked] = useState(Boolean(post.liked))
  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked))
  const [reposted, setReposted] = useState(Boolean(post.reposted))
  // Server-reconciled counts (real mode). Null until the API responds, in which
  // case we fall back to the optimistic-local derivation below.
  const [serverLikes, setServerLikes] = useState<number | null>(null)
  const [serverReposts, setServerReposts] = useState<number | null>(null)
  const [serverBookmarks, setServerBookmarks] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [tipHint, setTipHint] = useState(false)

  const localLikeCount =
    post.stats.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0)
  const likeCount = serverLikes ?? localLikeCount
  const localRepostCount =
    post.stats.reposts + (reposted && !post.reposted ? 1 : 0) - (!reposted && post.reposted ? 1 : 0)
  const repostCount = serverReposts ?? localRepostCount
  const localBookmarkCount =
    post.stats.bookmarks +
    (bookmarked && !post.bookmarked ? 1 : 0) -
    (!bookmarked && post.bookmarked ? 1 : 0)

  async function handleLike() {
    // Mock mode: keep the existing purely-local optimistic toggle.
    if (env.useMocks) {
      setLiked((v) => !v)
      return
    }
    // Real mode: optimistic flip, then reconcile with the returned count.
    const next = !liked
    setLiked(next)
    setServerLikes((prev) => (prev ?? localLikeCount) + (next ? 1 : -1))
    try {
      const res = next ? await likePost(post.id) : await unlikePost(post.id)
      setLiked(res.liked)
      setServerLikes(res.likes)
    } catch {
      // Roll back on failure.
      setLiked(!next)
      setServerLikes((prev) => (prev ?? localLikeCount) + (next ? -1 : 1))
    }
  }

  async function handleRepost() {
    if (env.useMocks) {
      setReposted((v) => !v)
      return
    }
    const next = !reposted
    setReposted(next)
    setServerReposts((prev) => (prev ?? localRepostCount) + (next ? 1 : -1))
    try {
      const res = next ? await repost(post.id) : await unrepost(post.id)
      setReposted(res.reposted)
      setServerReposts(res.reposts)
    } catch {
      setReposted(!next)
      setServerReposts((prev) => (prev ?? localRepostCount) + (next ? -1 : 1))
    }
  }

  async function handleBookmark() {
    if (env.useMocks) {
      setBookmarked((v) => !v)
      return
    }
    const next = !bookmarked
    setBookmarked(next)
    setServerBookmarks((prev) => (prev ?? localBookmarkCount) + (next ? 1 : -1))
    try {
      const res = next ? await bookmarkPost(post.id) : await unbookmarkPost(post.id)
      setBookmarked(res.bookmarked)
      setServerBookmarks(res.bookmarks)
    } catch {
      setBookmarked(!next)
      setServerBookmarks((prev) => (prev ?? localBookmarkCount) + (next ? -1 : 1))
    }
  }

  // Tipping isn't wired to a backend yet — show a brief "Soon" hint. ponytail: stub, wire to $FANS transfer later.
  function handleTip() {
    setTipHint(true)
    setTimeout(() => setTipHint(false), 1500)
  }

  async function handleShare() {
    const url = `${window.location.origin}${href}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Ignore clipboard failures (e.g. insecure context) — still show feedback.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card
      onClick={detail ? undefined : () => router.push(href)}
      className={cn(!detail && 'cursor-pointer transition-colors hover:border-[var(--color-accent)]/40')}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar>
            {post.author.avatarUrl ? <AvatarImage src={post.author.avatarUrl} alt={post.author.name} /> : null}
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold text-[var(--color-fg)]">{post.author.name}</span>
              {post.author.verified ? (
                <>
                  <Gem className="size-4 text-[var(--color-accent)]" aria-label="Club member" />
                  <BadgeCheck className="size-4 text-[var(--color-accent)]" aria-label="Verified" />
                </>
              ) : null}
              <span className="text-[var(--color-muted)]">@{post.author.handle}</span>
              <span className="text-[var(--color-muted)]">·</span>
              <span className="text-[var(--color-muted)]">{timeAgo(post.createdAt)}</span>
              <div className="ml-auto" onClick={(e: MouseEvent) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="More"
                      className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBookmark}>
                      {bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>Copy link</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p
              className={cn(
                'mt-1 whitespace-pre-wrap break-words text-[var(--color-fg)]',
                detail ? 'text-base' : 'text-sm',
              )}
            >
              {post.body}
            </p>

            {post.club ? <PriceChartInline club={post.club} /> : null}

            {/* Stop propagation so action clicks never trigger card navigation. */}
            <div
              className="mt-3 flex items-center justify-between pr-2"
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <Action icon={Heart} label="Like" count={likeCount} active={liked} activeClass="text-[var(--color-negative)]" onClick={handleLike} />
              <Action icon={MessageCircle} label="Comment" count={post.stats.comments} onClick={() => router.push(href)} />
              <Action icon={Repeat2} label="Repost" count={repostCount} active={reposted} activeClass="text-[var(--color-positive)]" onClick={handleRepost} />
              <button
                type="button"
                onClick={handleTip}
                aria-label="Tip"
                title="Tipping coming soon"
                className="group flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
              >
                <HandCoins className="size-4" />
                <span>{tipHint ? 'Soon' : 'Tip'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share"
                className="group relative flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
              >
                {copied ? <Check className="size-4 text-[var(--color-positive)]" /> : <Share className="size-4" />}
                {copied ? <span className="tabular-nums">Copied</span> : null}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
