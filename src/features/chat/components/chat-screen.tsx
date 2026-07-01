'use client'

import { MessagesSquare } from 'lucide-react'
import { useChatStore } from '../store'
import { MessageThread } from './message-thread'
import { RoomList } from './room-list'

export function ChatScreen() {
  const activeRoomId = useChatStore((s) => s.activeRoomId)

  return (
    <div className="flex h-full min-h-0">
      <RoomList />
      {activeRoomId ? (
        <MessageThread key={activeRoomId} roomId={activeRoomId} />
      ) : (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <MessagesSquare className="size-6 text-[var(--color-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-muted)]">Select a club to start chatting</p>
        </div>
      )}
    </div>
  )
}
