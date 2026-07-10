import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/shared/lib/format'
import type { ClubCardDto } from '../types'

/** Clubs list row: avatar + name + FT#id + description (Clubs / Holding tabs). */
export function ClubCard({ club }: { club: ClubCardDto }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-2 transition-colors hover:bg-[var(--color-surface-2)]">
      <Avatar className="size-10">
        {club.avatarUrl ? <AvatarImage src={club.avatarUrl} alt={club.name} /> : null}
        <AvatarFallback>{club.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-[var(--color-fg)]">{club.name}</p>
          <Badge className="shrink-0">FT#{club.ftId}</Badge>
        </div>
        {club.description ? (
          <p className="truncate text-xs text-[var(--color-muted)]">{club.description}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm text-[var(--color-fg)]">{club.keyPrice}</p>
        {typeof club.keyCount === 'number' ? (
          <p className="text-xs text-[var(--color-muted)]">
            {formatNumber(club.keyCount)} {club.keyCount === 1 ? 'key' : 'keys'}
          </p>
        ) : null}
      </div>
    </div>
  )
}
