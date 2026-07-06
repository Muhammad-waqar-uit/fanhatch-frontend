/** Notifications domain types. Aligned with docs/notifications-contract.md. */

export type NotificationType =
  | 'KEY_BOUGHT'
  | 'KEY_SOLD'
  | 'GIFT_RECEIVED'
  | 'CLUB_CREATED'
  | 'VOTE_RECEIVED'
  | 'PRESIDENT_ELECTED'
  | 'FOLLOWED'
  | 'POST_PUBLISHED'
  | 'POST_LIKED'
  | 'MENTIONED'
  | 'NEW_MESSAGE'
  | 'SWAP_EXECUTED'
  | 'STAKE_REWARD'
  | 'WELCOME'

export type NotificationStatus = 'UNREAD' | 'READ' | 'DELETED'

/** Drives tab grouping + deep-link routing. */
export type NotificationRelatedTo =
  | 'CLUB'
  | 'KEY'
  | 'POST'
  | 'CHAT'
  | 'GIFT'
  | 'VOTE'
  | 'SWAP'
  | 'STAKE'
  | 'USER'

/** User-toggleable notification categories. */
export type NotificationSettingType =
  | 'KEY_ACTIVITY'
  | 'GIFTS'
  | 'GOVERNANCE'
  | 'NEW_POSTS'
  | 'SOCIAL'
  | 'WALLET'

/** `data` jsonb payload — used for rendering + deep-linking. All fields optional. */
export interface NotificationData {
  actorId?: string
  actorName?: string
  actorHandle?: string
  actorAvatarUrl?: string
  clubId?: string
  clubName?: string
  creatorHandle?: string
  ticker?: string
  amount?: number
  price?: number
  votes?: number
  postId?: string
  excerpt?: string
  roomId?: string
  messageId?: string
  txHash?: string
  summary?: string
  farm?: string
}

export interface Notification {
  id: string
  type: NotificationType
  relatedTo: NotificationRelatedTo
  status: NotificationStatus
  title: string
  body?: string
  data: NotificationData
  createdAt: string
  readAt?: string | null
}

export interface NotificationSetting {
  type: NotificationSettingType
  status: boolean
}

/** Per-`relatedTo` unread tallies (lowercased keys) + grand `total`. */
export type UnreadCountKey =
  | 'club'
  | 'key'
  | 'post'
  | 'chat'
  | 'gift'
  | 'vote'
  | 'swap'
  | 'stake'
  | 'user'

export type UnreadCount = Record<UnreadCountKey, number> & { total: number }

/** List page tabs. */
export type NotificationTab = 'clubs' | 'governance' | 'social' | 'wallet'

export const NOTIFICATION_TABS: readonly NotificationTab[] = [
  'clubs',
  'governance',
  'social',
  'wallet',
] as const

export const TAB_LABELS: Record<NotificationTab, string> = {
  clubs: 'Clubs',
  governance: 'Governance',
  social: 'Social',
  wallet: 'Wallet',
}

/** Tab → which `relatedTo` values it includes (for server-side filtering). */
export const TAB_RELATED_TO: Record<NotificationTab, NotificationRelatedTo[]> = {
  clubs: ['CLUB', 'KEY', 'GIFT'],
  governance: ['VOTE'],
  social: ['POST', 'CHAT', 'USER'],
  wallet: ['SWAP', 'STAKE'],
}

/** Tab → which unread-count map keys sum into its badge. */
export const TAB_UNREAD_KEYS: Record<NotificationTab, UnreadCountKey[]> = {
  clubs: ['club', 'key', 'gift'],
  governance: ['vote'],
  social: ['post', 'chat', 'user'],
  wallet: ['swap', 'stake'],
}

/** Map a `relatedTo` enum onto its unread-count map key. */
export function relatedToKey(relatedTo: NotificationRelatedTo): UnreadCountKey {
  return relatedTo.toLowerCase() as UnreadCountKey
}

// --- Backend wire DTOs ------------------------------------------------------

export interface NotificationDto {
  id: string
  type: NotificationType
  relatedTo: NotificationRelatedTo
  status: NotificationStatus
  title: string
  body?: string | null
  data?: NotificationData | null
  createdAt: string
  readAt?: string | null
}

export interface NotificationPageMeta {
  total_page: number
  current_page: number
  limit: number
  total_record: number
}

/** Raw paginated envelope from `GET /notifications`. */
export interface NotificationPageDto {
  data: NotificationDto[]
  meta: NotificationPageMeta
}

/** Feature-side paginated result. */
export interface NotificationPage {
  items: Notification[]
  meta: NotificationPageMeta
}

export interface ListNotificationsParams {
  tab?: NotificationTab
  page?: number
  limit?: number
  /** Filter by read state: `true` = READ only, `false` = UNREAD only, omit = both. */
  read?: boolean
}
