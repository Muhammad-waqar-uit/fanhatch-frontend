'use client'

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/lib/cn'
import { timeAgo } from '@/shared/lib/format'
import { useFeed } from '../hooks/use-feed'
import type { FeedFilter, TradeActivity } from '../types'
import { PostCard } from './post-card'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TradeRow({ trade }: { trade: TradeActivity }) {
  const buy = trade.side === 'buy'
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar>
          <AvatarFallback>{initials(trade.user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-sm">
          <span className="font-semibold text-[var(--color-fg)]">{trade.user.name}</span>{' '}
          <span className={cn('font-medium', buy ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]')}>
            {buy ? 'bought' : 'sold'}
          </span>{' '}
          <span className="text-[var(--color-fg)]">
            {trade.amount} {trade.amount === 1 ? 'key' : 'keys'}
          </span>{' '}
          <span className="text-[var(--color-muted)]">of</span>{' '}
          <span className="font-semibold text-[var(--color-fg)]">${trade.ticker}</span>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">
            {trade.priceEth.toFixed(3)} ETH · {timeAgo(trade.createdAt)}
          </div>
        </div>
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            buy ? 'bg-[var(--color-positive)]/15 text-[var(--color-positive)]' : 'bg-[var(--color-negative)]/15 text-[var(--color-negative)]',
          )}
        >
          {buy ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
        </div>
      </CardContent>
    </Card>
  )
}

function FeedSkeleton() {
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

export function Feed() {
  const [filter, setFilter] = useState<FeedFilter>('all')
  const { data, isLoading, isError } = useFeed(filter)

  const posts = data?.posts ?? []
  const trades = data?.trades ?? []

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)}>
      <TabsList className="w-full">
        <TabsTrigger value="all">All Feed</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>

      <div className="mt-3">
        {isLoading ? (
          <FeedSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-[var(--color-muted)]">
              Couldn&apos;t load the feed. Please try again.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filter === 'transactions'
              ? trades.map((t) => <TradeRow key={t.id} trade={t} />)
              : posts.map((p) => <PostCard key={p.id} post={p} />)}

            {filter === 'transactions' && trades.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-[var(--color-muted)]">No transactions yet.</CardContent>
              </Card>
            ) : null}
            {filter !== 'transactions' && posts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-[var(--color-muted)]">No posts yet.</CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </Tabs>
  )
}
