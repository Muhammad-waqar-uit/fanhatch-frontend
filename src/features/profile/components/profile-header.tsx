import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { timeAgo } from '@/shared/lib/format'
import type { ProfileDto } from '../types'

/** "Last seen …" / "Last message sent …" presence line. */
function PresenceLine({ profile }: { profile: ProfileDto }) {
  const parts: string[] = []
  if (profile.lastSeen) parts.push(`Last seen ${timeAgo(profile.lastSeen)} ago`)
  if (profile.lastMessageAt) parts.push(`Last message sent ${timeAgo(profile.lastMessageAt)} ago`)
  return (
    <p className="text-xs text-[var(--color-muted)]">
      {parts.length ? parts.join(' · ') : '—'}
    </p>
  )
}

/** Header: avatar, display name, @handle, #userNumber, presence line, bio. */
export function ProfileHeader({ profile }: { profile: ProfileDto }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <Avatar className="size-20">
        {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={profile.displayName} /> : null}
        <AvatarFallback className="text-lg">
          {profile.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">{profile.displayName}</h1>
          <span className="text-sm text-[var(--color-muted)]">#{profile.userNumber}</span>
        </div>
        <p className="text-sm text-[var(--color-muted)]">@{profile.handle}</p>
        {profile.bio ? (
          <p className="mt-2 text-sm text-[var(--color-fg)]">{profile.bio}</p>
        ) : null}
        <div className="mt-1">
          <PresenceLine profile={profile} />
        </div>
      </div>
    </div>
  )
}
