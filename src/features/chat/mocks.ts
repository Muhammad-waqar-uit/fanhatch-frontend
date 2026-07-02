import type { ChatMessage, ChatRoom, UserCard } from './types'

/** Identifier used for messages authored by the signed-in user in mock mode. */
export const MOCK_CURRENT_USER_ID = 'me'

export const mockClubRooms: ChatRoom[] = [
  {
    id: 'club-fanstech',
    type: 'club',
    name: 'Fans.tech Founders',
    avatarUrl: 'https://i.pravatar.cc/96?img=12',
    lastMessage: 'gm holders, key buybacks are live',
    unread: 3,
    gated: true,
    memberCount: 248,
  },
  {
    id: 'club-degen',
    type: 'club',
    name: 'Degen Traders',
    avatarUrl: 'https://i.pravatar.cc/96?img=33',
    keyPrice: 0.09,
    unread: 0,
    gated: true,
    memberCount: 1280,
  },
  {
    id: 'club-builders',
    type: 'club',
    name: 'Base Builders',
    avatarUrl: 'https://i.pravatar.cc/96?img=5',
    lastMessage: 'shipping the new vault tonight',
    unread: 12,
    gated: true,
    memberCount: 540,
  },
  {
    id: 'club-creators',
    type: 'club',
    name: 'Creator Economy',
    avatarUrl: 'https://i.pravatar.cc/96?img=49',
    keyPrice: 0.42,
    gated: false,
    memberCount: 96,
  },
]

export const mockUserRooms: ChatRoom[] = [
  {
    id: 'dm-alice',
    type: 'dm',
    name: 'Alice Nguyen',
    avatarUrl: 'https://i.pravatar.cc/96?img=47',
    lastMessage: 'sent you a key gift',
    unread: 1,
    gated: false,
  },
  {
    id: 'dm-marco',
    type: 'dm',
    name: 'Marco Reyes',
    avatarUrl: 'https://i.pravatar.cc/96?img=15',
    lastMessage: 'lets vote for the new president',
    gated: false,
  },
  {
    id: 'dm-sora',
    type: 'dm',
    name: 'Sora Tanaka',
    avatarUrl: 'https://i.pravatar.cc/96?img=23',
    lastMessage: 'ty for the alpha 🙏',
    gated: false,
  },
]

export const mockRoomsByTab = {
  clubs: mockClubRooms,
  users: mockUserRooms,
} as const

/** Directory of people searchable in the "new DM" flow (mock mode). */
export const mockDmUsers: UserCard[] = [
  { id: 'kai', name: 'Kai Watanabe', handle: '@kai', avatarUrl: 'https://i.pravatar.cc/96?img=52' },
  { id: 'nadia', name: 'Nadia Farouk', handle: '@nadia', avatarUrl: 'https://i.pravatar.cc/96?img=31' },
  { id: 'diego', name: 'Diego Silva', handle: '@diego', avatarUrl: 'https://i.pravatar.cc/96?img=68' },
  { id: 'yuki', name: 'Yuki Sato', handle: '@yuki', avatarUrl: 'https://i.pravatar.cc/96?img=25' },
  { id: 'omar', name: 'Omar Haddad', handle: '@omar', avatarUrl: 'https://i.pravatar.cc/96?img=59' },
]

/**
 * Get-or-create a mock DM room for a user, mirroring the real `POST /chat/dm`
 * (1:1 get-or-create). Newly created rooms are prepended to `mockUserRooms` so
 * they surface in the Users tab once the rooms query is invalidated.
 */
export function getOrCreateMockDm(user: UserCard): ChatRoom {
  const id = `dm-${user.id}`
  const existing = mockUserRooms.find((room) => room.id === id)
  if (existing) return existing
  const room: ChatRoom = {
    id,
    type: 'dm',
    name: user.name,
    avatarUrl: user.avatarUrl,
    gated: false,
  }
  mockUserRooms.unshift(room)
  return room
}

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()

/** Seed messages keyed by room id. */
export const mockMessages: Record<string, ChatMessage[]> = {
  'club-fanstech': [
    {
      id: 'm1',
      roomId: 'club-fanstech',
      senderId: 'u-jordan',
      senderName: 'Jordan',
      senderHandle: 'jordan',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=8',
      body: 'gm holders, key buybacks are live 🔑',
      sentAt: minutesAgo(58),
      mine: false,
    },
    {
      id: 'm2',
      roomId: 'club-fanstech',
      senderId: MOCK_CURRENT_USER_ID,
      senderName: 'You',
      body: "let's go, what's the floor looking like?",
      sentAt: minutesAgo(42),
      mine: true,
    },
    {
      id: 'm3',
      roomId: 'club-fanstech',
      senderId: 'u-priya',
      senderName: 'Priya',
      senderHandle: 'priya',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=44',
      body: 'floor is holding ~0.12, volume is up 30% today',
      sentAt: minutesAgo(20),
      mine: false,
    },
  ],
  'club-degen': [
    {
      id: 'd1',
      roomId: 'club-degen',
      senderId: 'u-rex',
      senderName: 'Rex',
      senderHandle: 'rex',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=11',
      body: 'who is aping the new launch?',
      sentAt: minutesAgo(15),
      mine: false,
    },
  ],
  'club-builders': [
    {
      id: 'b1',
      roomId: 'club-builders',
      senderId: 'u-lee',
      senderName: 'Lee',
      senderHandle: 'lee',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=14',
      body: 'shipping the new vault tonight, reviews welcome',
      sentAt: minutesAgo(70),
      mine: false,
    },
    {
      id: 'b2',
      roomId: 'club-builders',
      senderId: MOCK_CURRENT_USER_ID,
      senderName: 'You',
      body: 'on it, sending feedback in a bit',
      sentAt: minutesAgo(64),
      mine: true,
    },
  ],
  'club-creators': [],
  'dm-alice': [
    {
      id: 'a1',
      roomId: 'dm-alice',
      senderId: 'dm-alice',
      senderName: 'Alice Nguyen',
      senderHandle: 'alice',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=47',
      body: 'sent you a key gift 🎁 welcome to the club!',
      sentAt: minutesAgo(8),
      mine: false,
    },
  ],
  'dm-marco': [
    {
      id: 'mk1',
      roomId: 'dm-marco',
      senderId: 'dm-marco',
      senderName: 'Marco Reyes',
      senderHandle: 'marco',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=15',
      body: 'lets vote for the new president this week',
      sentAt: minutesAgo(120),
      mine: false,
    },
  ],
  'dm-sora': [
    {
      id: 's1',
      roomId: 'dm-sora',
      senderId: 'dm-sora',
      senderName: 'Sora Tanaka',
      senderHandle: 'sora',
      senderAvatarUrl: 'https://i.pravatar.cc/96?img=23',
      body: 'ty for the alpha 🙏',
      sentAt: minutesAgo(200),
      mine: false,
    },
  ],
}
