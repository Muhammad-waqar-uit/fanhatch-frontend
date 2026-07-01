'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/shared/lib/cn'
import { formatUsd } from '@/shared/lib/format'
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
  const subtitle =
    room.lastMessage ?? (room.keyPrice != null ? formatUsd(room.keyPrice) : 'No messages yet')

  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-[var(--radius)] px-2 py-2 text-left transition-colors',
        active ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]',
      )}
    >
      <Avatar>
        <AvatarImage src={room.avatarUrl} alt={room.name} />
        <AvatarFallback>{initials(room.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-fg)]">{room.name}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
      </div>
      {room.unread ? (
        <Badge tone="accent" className="shrink-0">
          {room.unread}
        </Badge>
      ) : null}
    </button>
  )
}
