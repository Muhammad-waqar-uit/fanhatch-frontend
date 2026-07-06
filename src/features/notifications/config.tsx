import {
  AtSign,
  Coins,
  Crown,
  Gift,
  Heart,
  Key,
  MessageCircle,
  Newspaper,
  Repeat,
  Sparkles,
  UserPlus,
  Users,
  Vote,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationData, NotificationType } from './types'

/**
 * The ONE renderer config. Each notification type maps to an icon, an accent
 * colour (theme token class), title/body builders and a deep-link href builder.
 * `NotificationItem` reads this table — no switch statements anywhere.
 */
export interface NotificationConfig {
  icon: LucideIcon
  /** Tailwind text-colour class for the type icon. */
  accent: string
  title: (data: NotificationData) => string
  body: (data: NotificationData) => string | undefined
  href: (data: NotificationData) => string
}

const actor = (d: NotificationData) => d.actorName ?? 'Someone'
const userHandle = (d: NotificationData) => d.actorHandle ?? d.creatorHandle

/** `/u/<handle>` when we know a handle, else the home feed. */
const userHref = (d: NotificationData) => {
  const handle = userHandle(d)
  return handle ? `/u/${handle}` : '/'
}
/** `/chat?room=<id>` when a room is known, else the chat index. */
const chatHref = (d: NotificationData) => (d.roomId ? `/chat?room=${d.roomId}` : '/chat')
/** `/post/<id>` when a post is known, else the home feed. */
const postHref = (d: NotificationData) => (d.postId ? `/post/${d.postId}` : '/')

const keyLine = (d: NotificationData) => {
  const parts: string[] = []
  if (d.amount != null) parts.push(`${d.amount} ${d.ticker ?? 'key'}${d.amount > 1 ? 's' : ''}`)
  if (d.price != null) parts.push(`$${d.price}`)
  return parts.length ? parts.join(' · ') : undefined
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  KEY_BOUGHT: {
    icon: Key,
    accent: 'text-[var(--color-positive)]',
    title: (d) => `${actor(d)} bought your key`,
    body: keyLine,
    href: userHref,
  },
  KEY_SOLD: {
    icon: Key,
    accent: 'text-[var(--color-negative)]',
    title: (d) => `${actor(d)} sold their key`,
    body: keyLine,
    href: userHref,
  },
  GIFT_RECEIVED: {
    icon: Gift,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `${actor(d)} sent you a gift`,
    body: (d) =>
      d.amount != null
        ? `${d.amount} ${d.clubName ?? 'club'} key${d.amount > 1 ? 's' : ''}`
        : undefined,
    href: (d) => (d.roomId ? chatHref(d) : '/wallet'),
  },
  CLUB_CREATED: {
    icon: Users,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `${d.clubName ?? 'A new club'} was created`,
    body: (d) => (d.actorName ? `by ${d.actorName}` : undefined),
    href: userHref,
  },
  VOTE_RECEIVED: {
    icon: Vote,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `You received ${d.votes ?? 0} vote${d.votes === 1 ? '' : 's'}`,
    body: (d) => (d.clubName ? `${d.clubName} governance` : undefined),
    href: chatHref,
  },
  PRESIDENT_ELECTED: {
    icon: Crown,
    accent: 'text-[var(--color-positive)]',
    title: () => 'You were elected president',
    body: (d) => d.clubName,
    href: chatHref,
  },
  FOLLOWED: {
    icon: UserPlus,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `${actor(d)} followed you`,
    body: () => undefined,
    href: userHref,
  },
  POST_PUBLISHED: {
    icon: Newspaper,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `${actor(d)} published a new post`,
    body: (d) => d.excerpt,
    href: postHref,
  },
  POST_LIKED: {
    icon: Heart,
    accent: 'text-[var(--color-negative)]',
    title: (d) => `${actor(d)} liked your post`,
    body: (d) => d.excerpt,
    href: postHref,
  },
  MENTIONED: {
    icon: AtSign,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `${actor(d)} mentioned you`,
    body: (d) => d.excerpt,
    href: chatHref,
  },
  NEW_MESSAGE: {
    icon: MessageCircle,
    accent: 'text-[var(--color-accent)]',
    title: (d) => `New message from ${actor(d)}`,
    body: (d) => d.excerpt,
    href: chatHref,
  },
  SWAP_EXECUTED: {
    icon: Repeat,
    accent: 'text-[var(--color-accent)]',
    title: () => 'Swap executed',
    body: (d) => d.summary,
    href: () => '/wallet',
  },
  STAKE_REWARD: {
    icon: Coins,
    accent: 'text-[var(--color-positive)]',
    title: () => 'Staking reward available',
    body: (d) =>
      d.amount != null ? `${d.amount} $FANS${d.farm ? ` from ${d.farm}` : ''}` : undefined,
    href: () => '/wallet',
  },
  WELCOME: {
    icon: Sparkles,
    accent: 'text-[var(--color-accent)]',
    title: () => 'Welcome to Fans.tech',
    body: () => 'Join a club to start earning key rewards.',
    href: () => '/',
  },
}
