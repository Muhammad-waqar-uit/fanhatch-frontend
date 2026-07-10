import type { ReactNode } from 'react'
import { CalendarDays } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatJoinDate, timeAgo } from '@/shared/lib/format'
import type { ProfileDto } from '../types'

/** "Last seen …" / "Last message sent …" presence lines (stacked). */
function PresenceLine({ profile }: { profile: ProfileDto }) {
  if (!profile.lastSeen && !profile.lastMessageAt) {
    return <p className="text-xs text-[var(--color-muted)]">—</p>
  }
  return (
    <div className="flex flex-col gap-0.5 text-xs text-[var(--color-muted)]">
      {profile.lastSeen ? <span>Last seen {timeAgo(profile.lastSeen)} ago</span> : null}
      {profile.lastMessageAt ? (
        <span>Last message sent {timeAgo(profile.lastMessageAt)} ago</span>
      ) : null}
    </div>
  )
}

/**
 * Header: square avatar + identity (name / @handle / #id badge) with a
 * top-right `actions` slot, then a full-width block of presence, bio, joined
 * date and the `links` slot (Share / Snapshot Holders).
 */
export function ProfileHeader({
  profile,
  actions,
  links,
}: {
  profile: ProfileDto
  actions?: ReactNode
  links?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-20 rounded-2xl sm:size-24">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            ) : null}
            <AvatarFallback className="rounded-2xl text-lg">
              {profile.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[var(--color-fg)]">{profile.displayName}</h1>
            <p className="text-sm text-[var(--color-muted)]">@{profile.handle}</p>
            <Badge className="mt-1">#{profile.userNumber}</Badge>
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">{actions}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <PresenceLine profile={profile} />
        {profile.bio ? <p className="text-sm text-[var(--color-fg)]">{profile.bio}</p> : null}
        {profile.joinedAt ? (
          <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
            <CalendarDays className="size-3.5" />
            {formatJoinDate(profile.joinedAt)}
          </p>
        ) : null}
        {links ? <div className="flex flex-wrap items-center gap-4">{links}</div> : null}
      </div>
    </div>
  )
}
