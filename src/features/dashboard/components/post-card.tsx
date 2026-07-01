'use client'

import { BadgeCheck, Bookmark, Heart, MessageCircle, Repeat2, Share } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/shared/lib/cn'
import { formatNumber, timeAgo } from '@/shared/lib/format'
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

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(Boolean(post.liked))
  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked))

  const likeCount = post.stats.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0)
  const bookmarkCount =
    post.stats.bookmarks + (bookmarked && !post.bookmarked ? 1 : 0) - (!bookmarked && post.bookmarked ? 1 : 0)

  return (
    <Card>
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
                <BadgeCheck className="size-4 text-[var(--color-accent)]" aria-label="Verified" />
              ) : null}
              <span className="text-[var(--color-muted)]">@{post.author.handle}</span>
              <span className="text-[var(--color-muted)]">·</span>
              <span className="text-[var(--color-muted)]">{timeAgo(post.createdAt)}</span>
            </div>

            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[var(--color-fg)]">{post.body}</p>

            {post.club ? <PriceChartInline club={post.club} /> : null}

            <div className="mt-3 flex items-center justify-between pr-2">
              <Action icon={Heart} label="Like" count={likeCount} active={liked} activeClass="text-[var(--color-negative)]" onClick={() => setLiked((v) => !v)} />
              <Action icon={MessageCircle} label="Comment" count={post.stats.comments} />
              <Action icon={Repeat2} label="Repost" count={post.stats.reposts} />
              <Action icon={Share} label="Share" count={post.stats.shares} />
              <Action icon={Bookmark} label="Bookmark" count={bookmarkCount} active={bookmarked} activeClass="text-[var(--color-accent)]" onClick={() => setBookmarked((v) => !v)} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
