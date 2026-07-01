'use client'

import { useQuery } from '@tanstack/react-query'
import { PenSquare, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getRooms } from '../api/chat.api'
import { useChatStore } from '../store'
import type { ChatTab } from '../types'
import { NewDmDialog } from './new-dm-dialog'
import { RoomListItem } from './room-list-item'

export function RoomList() {
  const router = useRouter()
  const [tab, setTab] = useState<ChatTab>('clubs')
  const [dmDialogOpen, setDmDialogOpen] = useState(false)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const selectRoom = useChatStore((s) => s.selectRoom)

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['chat', 'rooms', tab],
    queryFn: () => getRooms(tab),
  })

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-r border-[var(--color-border)]">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-[var(--color-fg)]">My Rooms</h2>
        <div className="flex items-center gap-1">
          {tab === 'users' ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="New message"
              onClick={() => setDmDialogOpen(true)}
            >
              <PenSquare />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add club"
            onClick={() => router.push('/create-club')}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ChatTab)} className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="clubs" className="flex-1">
            Clubs Chats
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1">
            Users Chats
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="min-h-0 flex-1 px-2 py-2">
        {isLoading ? (
          <p className="px-2 py-4 text-sm text-[var(--color-muted)]">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <p className="px-2 py-4 text-sm text-[var(--color-muted)]">No rooms yet.</p>
        ) : (
          <div className="flex flex-col gap-1">
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

      {dmDialogOpen ? <NewDmDialog onClose={() => setDmDialogOpen(false)} /> : null}
    </div>
  )
}
