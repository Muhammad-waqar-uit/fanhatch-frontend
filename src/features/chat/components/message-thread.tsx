'use client'

import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { env } from '@/config/env'
import { formatNumber } from '@/shared/lib/format'
import { getMessages, getRooms } from '../api/chat.api'
import {
  getChatSocket,
  joinRoom,
  leaveRoom,
  onAccessRevoked,
  onMessage,
} from '../lib/socket'
import { useChatStore } from '../store'
import type { ChatRoom } from '../types'
import { MessageComposer } from './message-composer'
import { MessageItem } from './message-item'
import { RoomActionsMenu } from './room-actions-menu'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function MessageThread({ roomId }: { roomId: string }) {
  const setMessages = useChatStore((s) => s.setMessages)
  const appendMessage = useChatStore((s) => s.appendMessage)
  const messages = useChatStore((s) => s.messagesByRoom[roomId])
  const bottomRef = useRef<HTMLDivElement>(null)
  const [accessRevoked, setAccessRevoked] = useState(false)

  // Resolve room metadata from either tab.
  const { data: rooms = [] } = useQuery({
    queryKey: ['chat', 'rooms', 'all'],
    queryFn: async (): Promise<ChatRoom[]> => {
      const [clubs, users] = await Promise.all([getRooms('clubs'), getRooms('users')])
      return [...clubs, ...users]
    },
  })
  const room = rooms.find((r) => r.id === roomId)

  // Load messages for the active room into the store.
  const { data: fetched } = useQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: () => getMessages(roomId),
  })

  useEffect(() => {
    // Seed the store from the fetch ONLY when the room has no messages yet, so a
    // background refetch (staleTime) or room revisit never clobbers locally-sent messages.
    if (fetched && !useChatStore.getState().messagesByRoom[roomId]) {
      setMessages(roomId, fetched)
    }
  }, [fetched, roomId, setMessages])

  // Subscribe to live messages over the socket (no-op in mock mode).
  useEffect(() => {
    if (env.useMocks) return
    const socket = getChatSocket()
    if (!socket) return

    joinRoom(roomId)

    const offMessage = onMessage((message) => {
      if (message.roomId === roomId) appendMessage(message)
    })

    const offRevoked = onAccessRevoked(({ roomId: revokedId }) => {
      if (revokedId !== roomId) return
      leaveRoom(roomId)
      setAccessRevoked(true)
    })

    // After a reconnect, re-join whichever room is currently active.
    const handleConnect = (): void => {
      const activeRoomId = useChatStore.getState().activeRoomId
      if (activeRoomId) joinRoom(activeRoomId)
    }
    socket.on('connect', handleConnect)

    return () => {
      leaveRoom(roomId)
      offMessage()
      offRevoked()
      socket.off('connect', handleConnect)
    }
  }, [roomId, appendMessage])

  // Scroll to bottom when messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4">
        <Avatar>
          <AvatarImage src={room?.avatarUrl} alt={room?.name ?? ''} />
          <AvatarFallback>{room ? initials(room.name) : '?'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-fg)]">
            {room?.name ?? 'Chat'}
          </p>
          {room?.memberCount != null ? (
            <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
              <Users className="size-3" />
              {formatNumber(room.memberCount)} members
            </p>
          ) : null}
        </div>
        {room?.gated ? <Badge tone="accent">key-gated</Badge> : null}
        {room ? <RoomActionsMenu room={room} /> : null}
      </header>

      {accessRevoked ? (
        <p
          role="alert"
          className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2 text-xs text-[var(--color-muted)]"
        >
          Your access to this room was revoked. You can no longer send or receive messages here.
        </p>
      ) : null}

      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {(messages ?? []).map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <MessageComposer roomId={roomId} />
    </div>
  )
}
