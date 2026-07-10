'use client'

import { useQuery } from '@tanstack/react-query'
import { ListFilter, PenSquare } from 'lucide-react'
import type { ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/shared/lib/cn'
import { getRooms } from '../api/chat.api'
import { useChatStore } from '../store'
import type { ChatTab } from '../types'
import { RoomListItem } from './room-list-item'

/** Segmented pill toggle used for the Direct messages / Groups Chats switch. */
function TabPill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--color-fg)] text-[var(--color-bg)]'
          : 'bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-fg)]',
      )}
    >
      {children}
      {count != null ? (
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-semibold text-[var(--color-accent-fg)]">
          {count}
        </span>
      ) : null}
    </button>
  )
}

interface RoomListProps {
  tab: ChatTab
  onTabChange: (tab: ChatTab) => void
  onNewMessage: () => void
}

export function RoomList({ tab, onTabChange, onNewMessage }: RoomListProps) {
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const selectRoom = useChatStore((s) => s.selectRoom)

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['chat', 'rooms', tab],
    queryFn: () => getRooms(tab),
  })

  // Count for the "Groups Chats" badge; deduped with the active query on that tab.
  const { data: clubRooms } = useQuery({
    queryKey: ['chat', 'rooms', 'clubs'],
    queryFn: () => getRooms('clubs'),
  })

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col">
      <div className="flex items-center gap-3 px-3 pb-3 pt-3">
        <ListFilter className="size-5 shrink-0 text-[var(--color-muted)]" />
        <div className="flex items-center gap-2">
          <TabPill active={tab === 'users'} onClick={() => onTabChange('users')}>
            Direct messages
          </TabPill>
          <TabPill
            active={tab === 'clubs'}
            onClick={() => onTabChange('clubs')}
            count={clubRooms?.length}
          >
            Groups Chats
          </TabPill>
        </div>
        {tab === 'users' ? (
          <button
            type="button"
            aria-label="New message"
            onClick={onNewMessage}
            className="ml-auto inline-flex size-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
          >
            <PenSquare className="size-4" />
          </button>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2 pb-2">
        {isLoading ? (
          <p className="px-2 py-4 text-sm text-[var(--color-muted)]">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <p className="px-2 py-4 text-sm text-[var(--color-muted)]">No rooms yet.</p>
        ) : (
          <div className="flex flex-col">
            {rooms.map((room) => (
              <RoomListItem
                key={room.id}
                room={room}
                active={room.id === activeRoomId}
                onSelect={selectRoom}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
