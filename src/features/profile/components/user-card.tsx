import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatNumber } from '@/shared/lib/format'
import type { UserCardDto } from '../types'

/** A single user row used by the Followers / Following / Holders tabs. */
export function UserCard({ user }: { user: UserCardDto }) {
  return (
    <Link
      href={`/u/${user.handle}`}
      className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-2 transition-colors hover:bg-[var(--color-surface-2)]"
    >
      <Avatar className="size-10">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.displayName} /> : null}
        <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-fg)]">{user.displayName}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">@{user.handle}</p>
      </div>
      {typeof user.keyCount === 'number' ? (
        <span className="shrink-0 text-xs text-[var(--color-muted)]">
          {formatNumber(user.keyCount)} {user.keyCount === 1 ? 'key' : 'keys'}
        </span>
      ) : null}
    </Link>
  )
}
