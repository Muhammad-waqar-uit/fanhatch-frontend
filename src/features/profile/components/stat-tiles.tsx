'use client'

import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import type { ProfileStats, ProfileTab } from '../types'

const TILES: { key: Extract<ProfileTab, 'holders' | 'holding' | 'followers' | 'following'>; label: string }[] = [
  { key: 'holders', label: 'Holders' },
  { key: 'holding', label: 'Holding' },
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
]

/**
 * Stat tiles row: Holders · Holding · Followers · Following. Tapping a tile
 * selects the matching tab (via `onSelect`).
 */
export function StatTiles({
  stats,
  onSelect,
}: {
  stats: ProfileStats
  onSelect?: (tab: ProfileTab) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {TILES.map((tile) => (
        <button
          key={tile.key}
          type="button"
          onClick={() => onSelect?.(tile.key)}
          className={cn(
            'rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition-colors',
            onSelect && 'hover:bg-[var(--color-surface-2)]',
          )}
        >
          <p className="text-xs text-[var(--color-muted)]">{tile.label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-fg)]">
            {formatNumber(stats[tile.key], { compact: true })}
          </p>
        </button>
      ))}
    </div>
  )
}
