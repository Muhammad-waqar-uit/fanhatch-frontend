import { BadgeCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber, formatPct } from '@/shared/lib/format'
import type { DiscoverClub } from '../types'
import { Sparkline } from './sparkline'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** A trending-club card: avatar, name, ticker + FT#, price, change badge, sparkline. */
export function ClubCard({ club }: { club: DiscoverClub }) {
  const up = club.changePct >= 0

  return (
    <Link href={`/c/${club.id}`} className="block">
      <Card className="transition-colors hover:border-[var(--color-accent)]/40">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-10">
            {club.avatarUrl ? <AvatarImage src={club.avatarUrl} alt={club.name} /> : null}
            <AvatarFallback>{initials(club.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-[var(--color-fg)]">
                {club.name}
              </span>
              {club.verified ? (
                <BadgeCheck className="size-4 shrink-0 text-[var(--color-accent)]" aria-label="Verified" />
              ) : null}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <span className="font-medium text-[var(--color-fg)]">${club.ticker}</span>
              <span className="rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 tabular-nums">
                FT#{club.clubNo}
              </span>
            </div>
          </div>
          <Badge tone={up ? 'positive' : 'negative'} className="shrink-0">
            {up ? '▲' : '▼'} {formatPct(club.changePct)}
          </Badge>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold tabular-nums text-[var(--color-fg)]">
              {club.priceEth.toFixed(3)} ETH
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
              <Users className="size-3.5" />
              <span className="tabular-nums">{formatNumber(club.holders, { compact: true })}</span>
              <span>holders</span>
            </div>
          </div>
          <Sparkline history={club.history} up={up} className="shrink-0" />
        </div>
      </CardContent>
      </Card>
    </Link>
  )
}
