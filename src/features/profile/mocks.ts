/**
 * Mock data for the Profile feature so the app renders with no backend
 * (NEXT_PUBLIC_USE_MOCKS=true). Includes a `self` profile and an `other`
 * profile variant plus the six tab datasets.
 */
import type { Post } from '@/features/dashboard/types'
import type { ActivityDto, ClubCardDto, ProfileDto, UserCardDto } from './types'

/** The signed-in mock user id (mirrors the chat feature's convention). */
export const MOCK_CURRENT_USER_ID = 'me'
/** The handle that resolves to the signed-in user (renders the `self` view). */
export const MOCK_SELF_HANDLE = 'you'

/** The signed-in user's own profile (viewerRelation: 'self'). */
export const mockSelfProfile: ProfileDto = {
  id: MOCK_CURRENT_USER_ID,
  handle: MOCK_SELF_HANDLE,
  displayName: 'You',
  userNumber: 1042,
  bio: 'Building on Fans.tech. Trading keys, running my club.',
  avatarUrl: undefined,
  walletAddress: '0x8f3c...a91d',
  socials: { x: 'you_onchain', farcaster: 'you' },
  stats: { holders: 128, holding: 14, followers: 512, following: 87 },
  keyPrice: '0.042 ETH',
  ownKeyCount: 3,
  viewerRelation: 'self',
  joinedAt: '2023-03-14T00:00:00.000Z',
  lastSeen: new Date(Date.now() - 2 * 60_000).toISOString(),
  lastMessageAt: new Date(Date.now() - 40 * 60_000).toISOString(),
}

/** Another user's profile (viewerRelation: 'other' or 'following'). */
export const mockOtherProfile: ProfileDto = {
  id: 'u_satoshi',
  handle: 'satoshi',
  displayName: 'Satoshi',
  userNumber: 7,
  bio: 'Peer-to-peer electronic cash enjoyer. Key economics maxi.',
  avatarUrl: undefined,
  walletAddress: '0x1a2b...ff09',
  socials: { x: 'satoshi' },
  stats: { holders: 9021, holding: 3, followers: 120400, following: 12 },
  keyPrice: '1.337 ETH',
  ownKeyCount: 0,
  viewerRelation: 'other',
  joinedAt: '2021-06-01T00:00:00.000Z',
  lastSeen: new Date(Date.now() - 6 * 60 * 60_000).toISOString(),
  lastMessageAt: undefined,
}

/** Profiles keyed by handle so getProfile(handle) can resolve either variant. */
export const mockProfilesByHandle: Record<string, ProfileDto> = {
  [MOCK_SELF_HANDLE]: mockSelfProfile,
  me: mockSelfProfile,
  satoshi: mockOtherProfile,
}

export const mockFollowers: UserCardDto[] = [
  { id: 'u_vitalik', handle: 'vitalik', displayName: 'Vitalik', isFollowing: true },
  { id: 'u_hayden', handle: 'hayden', displayName: 'Hayden', isFollowing: false },
  { id: 'u_cdixon', handle: 'cdixon', displayName: 'Chris Dixon', isFollowing: false },
  { id: 'u_punk6529', handle: 'punk6529', displayName: '6529', isFollowing: true },
]

export const mockFollowing: UserCardDto[] = [
  { id: 'u_satoshi', handle: 'satoshi', displayName: 'Satoshi', isFollowing: true },
  { id: 'u_gavin', handle: 'gavin', displayName: 'Gavin', isFollowing: false },
  { id: 'u_balaji', handle: 'balaji', displayName: 'Balaji', isFollowing: true },
]

export const mockHolders: UserCardDto[] = [
  { id: 'u_whale', handle: 'whale', displayName: 'Whale', keyCount: 42 },
  { id: 'u_ape', handle: 'ape', displayName: 'Ape', keyCount: 12 },
  { id: 'u_degen', handle: 'degen', displayName: 'Degen', keyCount: 5 },
  { id: 'u_hodler', handle: 'hodler', displayName: 'Hodler', keyCount: 1 },
]

export const mockClubs: ClubCardDto[] = [
  {
    id: 'c_alpha',
    ftId: '128',
    name: 'Alpha Club',
    ticker: 'ALPHA',
    keyPrice: '0.042 ETH',
    description: 'Early-stage signal group for on-chain traders.',
  },
  {
    id: 'c_builders',
    ftId: '341',
    name: 'Builders',
    ticker: 'BUILD',
    keyPrice: '0.019 ETH',
    description: 'Founders and engineers shipping in public.',
  },
]

export const mockHolding: ClubCardDto[] = [
  {
    id: 'c_satoshi',
    ftId: '7',
    name: 'Satoshi',
    ticker: 'SATS',
    keyPrice: '1.337 ETH',
    description: "Satoshi's key.",
    keyCount: 2,
  },
  {
    id: 'c_vitalik',
    ftId: '31',
    name: 'Vitalik',
    ticker: 'VTLK',
    keyPrice: '0.88 ETH',
    description: "Vitalik's key.",
    keyCount: 1,
  },
]

export const mockActivity: ActivityDto[] = [
  {
    id: 'a1',
    type: 'buy',
    ts: new Date(Date.now() - 20 * 60_000).toISOString(),
    summary: 'Bought 1 key of SATS for 1.337 ETH',
  },
  {
    id: 'a2',
    type: 'president',
    ts: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    summary: 'Became president of Alpha Club',
  },
  {
    id: 'a3',
    type: 'sell',
    ts: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    summary: 'Sold 2 keys of BUILD for 0.038 ETH',
  },
  {
    id: 'a4',
    type: 'gift',
    ts: new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString(),
    summary: 'Gifted 1 key of ALPHA to @degen',
  },
]

const mockAuthor = {
  id: MOCK_CURRENT_USER_ID,
  name: 'You',
  handle: MOCK_SELF_HANDLE,
  verified: true,
}

/** Top-level posts authored by the profile owner (Posts tab). */
export const mockUserPosts: Post[] = [
  {
    id: 'up1',
    author: mockAuthor,
    body: 'Shipped a new dashboard for my club today. Key holders get early access. 🔑',
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    stats: { likes: 214, comments: 31, reposts: 18, shares: 7, bookmarks: 22 },
    liked: false,
    bookmarked: false,
  },
  {
    id: 'up2',
    author: mockAuthor,
    body: 'gm. building in public is the only way. what are you shipping this week?',
    createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    stats: { likes: 98, comments: 12, reposts: 4, shares: 2, bookmarks: 9 },
    liked: true,
    bookmarked: false,
  },
]

/** Replies authored by the profile owner (Replies tab). */
export const mockUserReplies: Post[] = [
  {
    id: 'ur1',
    author: mockAuthor,
    body: '@satoshi totally agree — key economics align holders and creators better than anything else.',
    createdAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    stats: { likes: 41, comments: 3, reposts: 1, shares: 0, bookmarks: 2 },
    liked: false,
    bookmarked: false,
  },
  {
    id: 'ur2',
    author: mockAuthor,
    body: '@mirac count me in for the Q&A tonight 👇',
    createdAt: new Date(Date.now() - 8 * 60 * 60_000).toISOString(),
    stats: { likes: 12, comments: 1, reposts: 0, shares: 0, bookmarks: 0 },
    liked: false,
    bookmarked: false,
  },
]

/** Posts the profile owner has liked (Likes tab). */
export const mockUserLikes: Post[] = [
  {
    id: 'ul1',
    author: { id: 'u_satoshi', name: 'Satoshi', handle: 'satoshi', verified: true },
    body: 'Peer-to-peer key markets are the purest form of creator monetization.',
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    stats: { likes: 1203, comments: 88, reposts: 210, shares: 44, bookmarks: 130 },
    liked: true,
    bookmarked: false,
  },
  {
    id: 'ul2',
    author: { id: 'u_vitalik', name: 'Vitalik', handle: 'vitalik', verified: true },
    body: 'Decentralized social + onchain keys is a genuinely interesting design space.',
    createdAt: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    stats: { likes: 842, comments: 60, reposts: 120, shares: 30, bookmarks: 90 },
    liked: true,
    bookmarked: true,
  },
]

/** Posts the signed-in user has bookmarked (Bookmarks screen). */
export const mockBookmarks: Post[] = [
  {
    id: 'bm1',
    author: { id: 'u_vitalik', name: 'Vitalik', handle: 'vitalik', verified: true },
    body: 'Decentralized social + onchain keys is a genuinely interesting design space.',
    createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    stats: { likes: 842, comments: 60, reposts: 120, shares: 30, bookmarks: 90 },
    liked: false,
    bookmarked: true,
  },
  {
    id: 'bm2',
    author: { id: 'u_hayden', name: 'Hayden', handle: 'hayden', verified: false },
    body: 'Rebalanced my club portfolio. $MIRA momentum is unreal this week.',
    createdAt: new Date(Date.now() - 20 * 60 * 60_000).toISOString(),
    stats: { likes: 76, comments: 11, reposts: 4, shares: 2, bookmarks: 6 },
    liked: true,
    bookmarked: true,
    club: {
      ticker: 'MIRA',
      priceEth: 0.512,
      changePct: -3.21,
      tradingValueEth: -0.014,
      history: [0.55, 0.548, 0.54, 0.535, 0.52, 0.525, 0.518, 0.514, 0.51, 0.512].map(
        (price, t) => ({ t, price }),
      ),
    },
  },
]
