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
  /** Current club key price in USD (shown for club rooms without a preview). */
  keyPrice?: number
  /** Unread message count. */
  unread?: number
  /** Whether the room is key-gated (requires holding a club key). */
  gated: boolean
  /** Member count, shown in the thread header. */
  memberCount?: number
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
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
