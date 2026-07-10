/** Chat domain types. Aligned with the backend `/chat` resources. */

export type ChatRoomType = 'club' | 'dm'

export type ChatTab = 'clubs' | 'users'

export interface ChatRoom {
  id: string
  type: ChatRoomType
  name: string
  avatarUrl?: string
  /** Latest message preview shown in the room list. */
  lastMessage?: string
  /** ISO timestamp of the latest message, shown as a relative time in the list. */
  lastMessageAt?: string
  /** Current club key price in USD (shown for club rooms without a preview). */
  keyPrice?: number
  /** Unread message count. */
  unread?: number
  /** Whether the room is key-gated (requires holding a club key). */
  gated: boolean
  /** Member count, shown in the thread header. */
  memberCount?: number
  /** Owning club id (present on club rooms; enables key gifting). */
  clubId?: string
}

/** Result of `POST /clubs/:id/keys/gift`. */
export interface GiftKeyResult {
  from: { keyCount: number }
  to: { userId: string; keyCount: number }
  club: { id: string; memberCount: number }
}

/** Minimal user reference used by the president governance endpoints. */
export interface UserRef {
  id: string
  handle: string
  name: string
}

/** Result of `POST /clubs/:id/president/vote`. */
export interface VoteResult {
  candidateId: string
  votes: number
  elected: boolean
  presidentId: string | null
}

/** A candidate's tally in the president standings. */
export interface PresidentStanding {
  candidate: UserRef
  votes: number
}

/** Result of `GET /clubs/:id/president`. */
export interface PresidentState {
  presidentId: string | null
  president: UserRef | null
  supply: number
  standings: PresidentStanding[]
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  /** Sender's handle (username); links to `/u/{handle}`. */
  senderHandle?: string
  senderAvatarUrl?: string
  body: string
  /** ISO timestamp. */
  sentAt: string
  /** True when the current user is the author (right-aligned, accent bubble). */
  mine: boolean
}

/** A user shown in the "new DM" search results. */
export interface UserCard {
  id: string
  name: string
  avatarUrl?: string
  /** Optional handle/username shown under the display name. */
  handle?: string
}

// --- Backend wire DTOs (see docs/04-chat/chat-realtime-contract.md) ---------

/** Raw user shape returned by `GET /users?search=`. */
export interface UserCardDto {
  id: string
  name: string
  avatarUrl?: string
  handle?: string
}


/** Room type as sent by the backend (the feature collapses `group` → `club`). */
export type ChatRoomTypeDto = 'club' | 'dm' | 'group'

/** Message body type as sent by the backend. */
export type ChatMessageTypeDto = 'text' | 'image' | 'gif'

/** Raw room shape returned by the REST API and gateway. */
export interface ChatRoomDto {
  id: string
  type: ChatRoomTypeDto
  name: string
  avatarUrl?: string
  clubId?: string
  memberCount: number
  lastMessage?: { body: string; sentAt: string }
  unread?: number
}

/** Raw message shape returned by the REST API and `message:new` event. */
export interface ChatMessageDto {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderHandle?: string
  senderAvatarUrl?: string
  type: ChatMessageTypeDto
  body: string
  /** ISO timestamp. */
  sentAt: string
}

/** Cursor-paginated message history page (`GET /chat/rooms/:id/messages`). */
export interface ChatMessagePageDto {
  items: ChatMessageDto[]
  nextCursor: string | null
}
