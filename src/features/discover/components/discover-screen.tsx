'use client'

import { Loader2, Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { useCreators, useDiscoverSearch, useTrendingClubs } from '../hooks/use-discover'
import type { DiscoverFilter } from '../types'
import { ClubCard } from './club-card'
import { CreatorCard } from './creator-card'

const FILTERS: { id: DiscoverFilter; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
  { id: 'top-clubs', label: 'Top Clubs' },
  { id: 'creators', label: 'Creators' },
]

/**
 * Discover / explore screen: search bar, filter chips, a Trending Clubs grid and
 * a Suggested Creators list. UI-only — filters/search operate over static mocks.
 * Owns its own scroll (the AppShell <main> is overflow-hidden).
 */
export function DiscoverScreen() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<DiscoverFilter>('trending')

  const searching = query.trim().length > 0
  const trendingQ = useTrendingClubs()
  const creatorsQ = useCreators()
  const searchQ = useDiscoverSearch(query)

  const rawClubs = searching ? (searchQ.data?.clubs ?? []) : (trendingQ.data ?? [])
  const clubs = useMemo(() => {
    if (filter === 'top-clubs') return [...rawClubs].sort((a, b) => b.holders - a.holders)
    if (filter === 'new') return [...rawClubs].sort((a, b) => b.clubNo - a.clubNo)
    return rawClubs
  }, [rawClubs, filter])
  const creators = searching ? (searchQ.data?.creators ?? []) : (creatorsQ.data ?? [])

  const clubsLoading = searching ? searchQ.isLoading : trendingQ.isLoading
  const creatorsLoading = searching ? searchQ.isLoading : creatorsQ.isLoading

  const showClubs = filter !== 'creators'
  const showCreators = filter === 'creators' || filter === 'trending' || searching

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-fg)]">Discover</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Explore trending clubs and creators across Fanhatch.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs, creators, posts"
            aria-label="Search clubs, creators, posts"
            className="h-12 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-4 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-transparent bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Trending clubs */}
        {showClubs ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-semibold text-[var(--color-fg)]">
                {filter === 'top-clubs' ? 'Top Clubs' : filter === 'new' ? 'New Clubs' : 'Trending Clubs'}
              </h2>
              <span className="text-xs text-[var(--color-muted)]">· {clubs.length}</span>
            </div>
            {clubsLoading ? (
              <LoadingRow />
            ) : clubs.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {clubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Sparkles} label="No clubs match your search." />
            )}
          </section>
        ) : null}

        {/* Suggested creators */}
        {showCreators ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-semibold text-[var(--color-fg)]">Suggested Creators</h2>
              <span className="text-xs text-[var(--color-muted)]">· {creators.length}</span>
            </div>
            {creatorsLoading ? (
              <LoadingRow />
            ) : creators.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {creators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Sparkles} label="No creators match your search." />
            )}
          </section>
        ) : null}
      </div>
    </div>
  )
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-[var(--color-border)] py-12 text-sm text-[var(--color-muted)]">
      <Loader2 className="size-4 animate-spin" />
      Loading…
    </div>
  )
}

function EmptyState({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[var(--radius)] border border-dashed border-[var(--color-border)] py-12 text-center">
      <Icon className="size-5 text-[var(--color-muted)]" />
      <p className="text-sm text-[var(--color-muted)]">{label}</p>
    </div>
  )
}
