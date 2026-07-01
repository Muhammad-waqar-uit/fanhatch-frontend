'use client'

import { TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/shared/lib/cn'
import { formatPct } from '@/shared/lib/format'
import { useTrending } from '../hooks/use-trending'
import type { TrendingItem } from '../types'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TrendingRow({ item }: { item: TrendingItem }) {
  const up = item.changePct >= 0
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-[var(--radius)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-surface-2)]"
    >
      <Avatar className="size-8">
        {item.avatarUrl ? <AvatarImage src={item.avatarUrl} alt={item.name} /> : null}
        <AvatarFallback>{initials(item.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[var(--color-fg)]">{item.name}</div>
        <div className="truncate text-xs text-[var(--color-muted)]">${item.ticker}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-medium text-[var(--color-fg)]">{item.priceEth.toFixed(3)}</div>
        <div className={cn('text-xs', up ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]')}>
          {up ? '▲' : '▼'} {formatPct(item.changePct)}
        </div>
      </div>
    </button>
  )
}

export function TrendingPanel() {
  const { data, isLoading } = useTrending()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="size-4 text-[var(--color-accent)]" />
        <h2 className="text-sm font-semibold text-[var(--color-fg)]">Trending</h2>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {isLoading ? (
          <div className="space-y-2 px-2 py-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-[var(--radius)] bg-[var(--color-surface-2)]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {(data ?? []).map((item) => (
              <TrendingRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
