import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import { getCurrentUserId } from '../lib/current-user'
import {
  getOrCreateMockDm,
  mockDmUsers,
  mockMessages,
  mockRoomsByTab,
  MOCK_CURRENT_USER_ID,
} from '../mocks'
import type {
  ChatMessage,
  ChatMessageDto,
  ChatMessagePageDto,
  ChatRoom,
  ChatRoomDto,
  ChatTab,
  UserCard,
  UserCardDto,
} from '../types'

/** Small artificial delay so mock loading states are observable. */
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

/** Map a backend room DTO onto the feature's `ChatRoom`. */
export function mapRoom(dto: ChatRoomDto): ChatRoom {
  return {
    id: dto.id,
    // The feature only models 'club' | 'dm'; backend 'group' collapses to 'club'.
    type: dto.type === 'dm' ? 'dm' : 'club',
    name: dto.name,
    avatarUrl: dto.avatarUrl,
    lastMessage: dto.lastMessage?.body,
    unread: dto.unread,
    // Club rooms are key-gated (clubId is the future gating key); DMs are not.
    gated: dto.type === 'club',
    memberCount: dto.memberCount,
  }
}

/** Map a backend user DTO onto the feature's `UserCard`. */
export function mapUser(dto: UserCardDto): UserCard {
  return { id: dto.id, name: dto.name, avatarUrl: dto.avatarUrl, handle: dto.handle }
}

/** Map a backend message DTO onto the feature's `ChatMessage`. */
export function mapMessage(dto: ChatMessageDto): ChatMessage {
  return {
    id: dto.id,
    roomId: dto.roomId,
    senderId: dto.senderId,
    senderName: dto.senderName,
    senderHandle: dto.senderHandle,
    senderAvatarUrl: dto.senderAvatarUrl,
    body: dto.body,
    sentAt: dto.sentAt,
    mine: dto.senderId === getCurrentUserId(),
  }
}

/** GET /chat/rooms?type=club|dm */
export async function getRooms(tab: ChatTab): Promise<ChatRoom[]> {
  if (env.useMocks) {
    return delay([...mockRoomsByTab[tab]])
  }
  const type = tab === 'clubs' ? 'club' : 'dm'
  const dtos = await apiClient.get<unknown, ChatRoomDto[]>('/chat/rooms', { params: { type } })
  return dtos.map(mapRoom)
}

/**
 * GET /chat/rooms/:id/messages — cursor-paginated, returned newest→older by the
 * backend. We map and reverse to chronological order (oldest first) so the thread
 * renders top→bottom like the mock seed data.
 *
 * TODO: surface `nextCursor` to wire up infinite "load older" pagination.
 */
export async function getMessages(roomId: string, cursor?: string): Promise<ChatMessage[]> {
  if (env.useMocks) {
    return delay([...(mockMessages[roomId] ?? [])])
  }
  const page = await apiClient.get<unknown, ChatMessagePageDto>(
    `/chat/rooms/${roomId}/messages`,
    { params: { cursor, limit: 30 } },
  )
  return page.items.map(mapMessage).reverse()
}

/**
 * POST /chat/rooms/:id/messages — REST fallback for sending.
 *
 * In real mode the composer prefers the socket path (`sendMessageWs`), which acks
 * the persisted message; this REST route remains for mock mode and as a fallback.
 */
export async function sendMessage(roomId: string, body: string): Promise<ChatMessage> {
  if (env.useMocks) {
    const message: ChatMessage = {
      id: `local-${crypto.randomUUID()}`,
      roomId,
      senderId: MOCK_CURRENT_USER_ID,
      senderName: 'You',
      body,
      sentAt: new Date().toISOString(),
      mine: true,
    }
    return delay(message, 0)
  }
  const dto = await apiClient.post<unknown, ChatMessageDto>(`/chat/rooms/${roomId}/messages`, {
    body,
  })
  return mapMessage(dto)
}

/**
 * GET /users?search= — people search for the "new DM" flow. The backend may
 * return a bare `UserCardDto[]` or an `{ items }` envelope; we accept both.
 */
export async function searchUsers(query: string): Promise<UserCard[]> {
  const q = query.trim()
  if (env.useMocks) {
    if (!q) return delay([])
    const needle = q.toLowerCase()
    return delay(
      mockDmUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(needle) ||
          (u.handle ?? '').toLowerCase().includes(needle),
      ),
    )
  }
  const res = await apiClient.get<unknown, UserCardDto[] | { items: UserCardDto[] }>('/users', {
    params: { search: q },
  })
  const items = Array.isArray(res) ? res : res.items
  return items.map(mapUser)
}

/** POST /chat/dm — get-or-create a 1:1 DM room with a peer, then map it. */
export async function createDm(peerUserId: string): Promise<ChatRoom> {
  if (env.useMocks) {
    const user = mockDmUsers.find((u) => u.id === peerUserId) ?? {
      id: peerUserId,
      name: 'New chat',
    }
    return delay(getOrCreateMockDm(user))
  }
  const dto = await apiClient.post<unknown, ChatRoomDto>('/chat/dm', { peerUserId })
  return mapRoom(dto)
}
