'use client'

import { BadgeCheck, Check, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/shared/lib/format'
import type { DiscoverCreator } from '../types'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Suggested-creator card: avatar, name, @handle, followers, Follow toggle. */
export function CreatorCard({ creator }: { creator: DiscoverCreator }) {
  const [following, setFollowing] = useState(false)

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar className="size-11">
          {creator.avatarUrl ? <AvatarImage src={creator.avatarUrl} alt={creator.name} /> : null}
          <AvatarFallback>{initials(creator.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[var(--color-fg)]">
              {creator.name}
            </span>
            {creator.verified ? (
              <BadgeCheck className="size-4 shrink-0 text-[var(--color-accent)]" aria-label="Verified" />
            ) : null}
          </div>
          <div className="truncate text-xs text-[var(--color-muted)]">@{creator.handle}</div>
          <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{creator.bio}</p>
          <div className="mt-1 text-xs text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-fg)] tabular-nums">
              {formatNumber(creator.followers, { compact: true })}
            </span>{' '}
            followers
          </div>
        </div>

        <Button
          size="sm"
          variant={following ? 'outline' : 'primary'}
          onClick={() => setFollowing((v) => !v)}
          aria-pressed={following}
          className="shrink-0"
        >
          {following ? <Check /> : <UserPlus />}
          {following ? 'Following' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  )
}
