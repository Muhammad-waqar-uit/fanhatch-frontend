/** Domain types for the User Profile feature (see docs/06-profile). */

/** The viewer's relationship to the profile owner; drives the action set. */
export type ViewerRelation = 'self' | 'following' | 'other' | 'anonymous'

/** Social links surfaced on the header (verified elsewhere). */
export interface ProfileSocials {
  x?: string
  farcaster?: string
}

/** Aggregate counts backing the stat tiles and the four social tabs. */
export interface ProfileStats {
  holders: number
  holding: number
  followers: number
  following: number
}

/** Full profile payload from `GET /users/:handle`. */
export interface ProfileDto {
  id: string
  handle: string
  displayName: string
  userNumber: number
  bio?: string
  avatarUrl?: string
  walletAddress?: string
  socials?: ProfileSocials
  stats: ProfileStats
  /** Creator/own only — current curve buy price (formatted, e.g. "0.042 ETH"). */
  keyPrice?: string
  /** Creator/own only — viewer's balance of this owner's key. */
  ownKeyCount?: number
  viewerRelation: ViewerRelation
  /** ISO timestamp the user joined — drives the "Joined <Month Year>" line. */
  joinedAt?: string
  /** ISO timestamp for the "Last seen …" presence line. */
  lastSeen?: string
  /** ISO timestamp for the "Last message sent …" presence line. */
  lastMessageAt?: string
}

/** Compact user row used by Followers / Following / Holders lists. */
export interface UserCardDto {
  id: string
  handle: string
  displayName: string
  avatarUrl?: string
  /** Present on Holders rows: how many of the owner's keys this user holds. */
  keyCount?: number
  /** Present on Followers/Following rows: is the viewer following this user. */
  isFollowing?: boolean
}

/** Club row used by the Clubs and Holding tabs. */
export interface ClubCardDto {
  id: string
  ftId: string
  name: string
  ticker: string
  avatarUrl?: string
  keyPrice: string
  description?: string
  /** Present on Holding rows: keys the owner holds in this club. */
  keyCount?: number
}

/** A single activity-feed entry (trades + posts + governance). */
export interface ActivityDto {
  id: string
  type: 'buy' | 'sell' | 'gift' | 'post' | 'president'
  ts: string
  summary: string
}

/** Editable fields for `PATCH /users/me`. */
export interface UpdateProfileInput {
  displayName?: string
  bio?: string
  avatarUrl?: string
  socials?: ProfileSocials
}

/** The profile tabs: social/crypto tabs plus the X-style Posts / Replies / Likes. */
export type ProfileTab =
  | 'posts'
  | 'replies'
  | 'likes'
  | 'clubs'
  | 'activity'
  | 'holders'
  | 'holding'
  | 'followers'
  | 'following'
