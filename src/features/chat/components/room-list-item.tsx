'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/shared/lib/cn'
import { formatUsd, timeAgo } from '@/shared/lib/format'
import type { ChatRoom } from '../types'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface RoomListItemProps {
  room: ChatRoom
  active: boolean
  onSelect: (roomId: string) => void
}

export function RoomListItem({ room, active, onSelect }: RoomListItemProps) {
  const subtitle = room.lastMessage ?? 'No messages yet'

  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-3 text-left transition-colors',
        active
          ? 'bg-[var(--color-fg)] text-[var(--color-bg)]'
          : 'border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]',
      )}
    >
      <Avatar className="size-10">
        <AvatarImage src={room.avatarUrl} alt={room.name} />
        <AvatarFallback>{initials(room.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold',
            active ? 'text-[var(--color-bg)]' : 'text-[var(--color-fg)]',
          )}
        >
          {room.name}
        </p>
        <p
          className={cn(
            'truncate text-xs',
            active ? 'text-[var(--color-bg)]/60' : 'text-[var(--color-muted)]',
          )}
        >
          {subtitle}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {room.lastMessageAt ? (
          <span
            className={cn(
              'text-[11px]',
              active ? 'text-[var(--color-bg)]/60' : 'text-[var(--color-muted)]',
            )}
          >
            {timeAgo(room.lastMessageAt)}
          </span>
        ) : null}
        {room.keyPrice != null ? (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              active
                ? 'bg-[var(--color-bg)] text-[var(--color-fg)]'
                : 'bg-[var(--color-surface-2)] text-[var(--color-fg)]',
            )}
          >
            {formatUsd(room.keyPrice)}
          </span>
        ) : room.unread ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[11px] font-medium text-[var(--color-accent-fg)]">
            {room.unread}
          </span>
        ) : null}
      </div>
    </button>
  )
}
