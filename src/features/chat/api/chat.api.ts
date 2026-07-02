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
  GiftKeyResult,
  PresidentState,
  UserCard,
  UserCardDto,
  UserRef,
  VoteResult,
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
    clubId: dto.clubId,
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

/**
 * POST /clubs/:id/keys/gift — gift `amount` club key(s) to another user. The
 * signed-in user's balance decreases and the recipient's increases; the club's
 * member count grows when the recipient becomes a new holder.
 */
export async function giftKey(
  clubId: string,
  toUserId: string,
  amount = 1,
): Promise<GiftKeyResult> {
  if (env.useMocks) {
    // Mimic the backend's 400s so the dialog's error states are exercisable.
    if (toUserId === MOCK_CURRENT_USER_ID) {
      return Promise.reject(new Error('You cannot gift a key to yourself.'))
    }
    if (amount < 1) {
      return Promise.reject(new Error('Insufficient keys.'))
    }
    return delay({
      from: { keyCount: Math.max(0, 5 - amount) },
      to: { userId: toUserId, keyCount: amount },
      club: { id: clubId, memberCount: 249 },
    })
  }
  return apiClient.post<unknown, GiftKeyResult>(`/clubs/${clubId}/keys/gift`, {
    toUserId,
    amount,
  })
}

// --- President governance (mock tally) --------------------------------------

/** Seed candidates used to make mock standings look plausible. */
const mockPresidentCandidates: UserRef[] = [
  { id: 'kai', handle: '@kai', name: 'Kai Watanabe' },
  { id: 'nadia', handle: '@nadia', name: 'Nadia Farouk' },
  { id: 'diego', handle: '@diego', name: 'Diego Silva' },
]

/** In-memory vote tallies keyed by `clubId`, so re-voting updates standings. */
const mockPresidentTallies: Record<string, Map<string, number>> = {}

/** Total mock key supply per club — an election needs a majority of this. */
const MOCK_PRESIDENT_SUPPLY = 5

/** Lazily seed a club's tally with some starting votes. */
function getMockTally(clubId: string): Map<string, number> {
  let tally = mockPresidentTallies[clubId]
  if (!tally) {
    tally = new Map<string, number>([
      ['kai', 2],
      ['nadia', 1],
    ])
    mockPresidentTallies[clubId] = tally
  }
  return tally
}

/** Resolve a candidate's `UserRef`, falling back to the id for unknown voters. */
function resolveCandidate(candidateId: string): UserRef {
  const seeded = mockPresidentCandidates.find((c) => c.id === candidateId)
  if (seeded) return seeded
  const dmUser = mockDmUsers.find((u) => u.id === candidateId)
  if (dmUser) {
    return { id: dmUser.id, handle: dmUser.handle ?? `@${dmUser.id}`, name: dmUser.name }
  }
  return { id: candidateId, handle: `@${candidateId}`, name: candidateId }
}

/** Build the current standings snapshot from a mock tally. */
function mockStandingsFromTally(clubId: string): PresidentState {
  const tally = getMockTally(clubId)
  const standings = [...tally.entries()]
    .map(([id, votes]) => ({ candidate: resolveCandidate(id), votes }))
    .sort((a, b) => b.votes - a.votes)
  const leader = standings[0]
  const elected = Boolean(leader && leader.votes > MOCK_PRESIDENT_SUPPLY / 2)
  return {
    presidentId: elected ? leader.candidate.id : null,
    president: elected ? leader.candidate : null,
    supply: MOCK_PRESIDENT_SUPPLY,
    standings,
  }
}

/**
 * GET /clubs/:id/president — current president (if elected) and the live vote
 * standings for the club's governance election.
 */
export async function getPresidentStanding(clubId: string): Promise<PresidentState> {
  if (env.useMocks) {
    return delay(mockStandingsFromTally(clubId))
  }
  return apiClient.get<unknown, PresidentState>(`/clubs/${clubId}/president`)
}

/**
 * POST /clubs/:id/president/vote — cast a vote for `candidateId`. A candidate is
 * elected once they hold a majority of the club's key supply.
 */
export async function voteForPresident(
  clubId: string,
  candidateId: string,
): Promise<VoteResult> {
  if (env.useMocks) {
    if (!candidateId) {
      return Promise.reject(new Error('Pick a candidate to vote for.'))
    }
    const tally = getMockTally(clubId)
    const votes = (tally.get(candidateId) ?? 0) + 1
    tally.set(candidateId, votes)
    const elected = votes > MOCK_PRESIDENT_SUPPLY / 2
    return delay({
      candidateId,
      votes,
      elected,
      presidentId: elected ? candidateId : null,
    })
  }
  return apiClient.post<unknown, VoteResult>(`/clubs/${clubId}/president/vote`, {
    candidateId,
  })
}
