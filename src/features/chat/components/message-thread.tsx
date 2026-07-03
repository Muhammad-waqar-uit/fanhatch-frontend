'use client'

import { useQuery } from '@tanstack/react-query'
import { Lock, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { env } from '@/config/env'
import {
  resolveClubKeyAddress,
  useBuyKey,
  useKeyPrice,
  useWeb3Context,
  web3Config,
} from '@/features/web3'
import { formatNumber } from '@/shared/lib/format'
import { getMessages, getRooms } from '../api/chat.api'
import { toClubIdBig, txErrorMessage } from '../lib/onchain'
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
  // Set when the gateway denies a club join for lack of a key. Reset per-room.
  const [locked, setLocked] = useState(false)

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
    // Reset gating state whenever the room changes; mock mode is never locked.
    setLocked(false)
    setAccessRevoked(false)
    if (env.useMocks) return
    const socket = getChatSocket()
    if (!socket) return

    // The join ack gates club rooms: `{ ok: false, error: 'KEY_REQUIRED' }`.
    void joinRoom(roomId).then((ack) => {
      if (!ack.ok && ack.error === 'KEY_REQUIRED') setLocked(true)
    })

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
      if (activeRoomId) void joinRoom(activeRoomId)
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

      {locked ? (
        <div
          role="alert"
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <Lock className="size-6" />
          </span>
          <p className="text-sm font-semibold text-[var(--color-fg)]">
            🔒 This club is key-gated
          </p>
          <p className="max-w-xs text-xs text-[var(--color-muted)]">
            You need a key to join {room?.name ?? 'this club'}.
          </p>
          <GetKeyButton room={room} />
        </div>
      ) : (
        <>
          <ScrollArea className="min-h-0 flex-1 px-4 py-4">
            <div className="flex flex-col gap-4">
              {(messages ?? []).map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <MessageComposer roomId={roomId} />
        </>
      )}
    </div>
  )
}

/**
 * "Get a key" affordance for the locked club panel. When web3 is enabled and the
 * wallet is connected (and the room has a numeric on-chain clubId), it buys one key
 * on-chain via a sponsored userop — resolving the ClubKey + a fresh buy-price quote
 * first, then showing pending/success/error inline. Otherwise it keeps the web2
 * behaviour of routing to the Wallet screen.
 */
function GetKeyButton({ room }: { room?: ChatRoom }) {
  const router = useRouter()
  const { isConnected } = useWeb3Context()
  const clubIdBig = toClubIdBig(room?.clubId)
  const onchain = web3Config.enabled && isConnected && clubIdBig !== null

  // Resolve the club's ClubKey address (from the factory) only on the on-chain path.
  const clubKeyQuery = useQuery({
    queryKey: ['web3', 'clubKeyAddr', room?.clubId],
    enabled: onchain,
    queryFn: () => resolveClubKeyAddress({ clubId: clubIdBig! }),
  })
  // Quote the buy price for 1 key; the hook self-disables until the address resolves.
  const priceQuery = useKeyPrice(clubKeyQuery.data ?? undefined, 1n)
  const buyKey = useBuyKey()

  if (!onchain) {
    return (
      <Button size="sm" onClick={() => router.push('/wallet')}>
        Get a key
      </Button>
    )
  }

  const buyPrice = priceQuery.data?.buy.raw
  const preparing = clubKeyQuery.isLoading || priceQuery.isLoading || buyPrice === undefined
  const label = buyKey.isPending
    ? 'Buying key…'
    : buyKey.isSuccess
      ? 'Key purchased'
      : preparing
        ? 'Preparing…'
        : 'Buy a key'

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="sm"
        disabled={preparing || buyKey.isPending || buyKey.isSuccess}
        onClick={() =>
          buyKey.mutate({
            clubId: clubIdBig!,
            clubKey: clubKeyQuery.data ?? undefined,
            amount: 1n,
            buyPrice,
          })
        }
      >
        {label}
      </Button>
      {buyKey.isError ? (
        <p className="max-w-xs text-xs text-[var(--color-danger,#ef4444)]">
          {txErrorMessage(buyKey.error, 'Could not buy a key. Please try again.')}
        </p>
      ) : buyKey.isSuccess ? (
        <p className="max-w-xs text-xs text-[var(--color-muted)]">
          Your key is on its way — reopen the club once the transaction confirms.
        </p>
      ) : null}
    </div>
  )
}
