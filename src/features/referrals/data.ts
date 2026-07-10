import {
  Coins,
  Contact,
  DollarSign,
  Instagram,
  MessageCircle,
  MoreHorizontal,
  QrCode,
  TrendingUp,
  Twitter,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * Static, UI-only content for the Referrals screen. Values are copied verbatim
 * from the Fanhatch figma reference — there is no backend here.
 */

export const REFERRAL_HERO = {
  titlePrefix: 'Invite Friends and Get ',
  titleAccent: '$10 USDT',
  titleSuffix: ' Each',
  subtitle: 'Share your link and get $10 USDT for every friend who joins and trades',
} as const

export const REFERRAL_LINK = 'http://fanhatch.tech/join/fans2026'
export const REFERRAL_CODE = 'FANS2026'

export type RewardTile = {
  icon: LucideIcon
  /** Tailwind classes for the small colored icon chip. */
  chipClassName: string
  title: string
  subtitle: string
}

/** The 2x2 grid of reward tiles, each with its own colored icon chip. */
export const REWARD_TILES: RewardTile[] = [
  {
    icon: DollarSign,
    chipClassName: 'bg-teal-500/15 text-teal-400',
    title: '$10 USDT',
    subtitle: 'For every successful referral',
  },
  {
    icon: Coins,
    chipClassName: 'bg-amber-500/15 text-amber-400',
    title: '150',
    subtitle: 'Token bonus',
  },
  {
    icon: TrendingUp,
    chipClassName: 'bg-violet-500/15 text-violet-400',
    title: '15%',
    subtitle: 'Trading fees for you',
  },
  {
    icon: Users,
    chipClassName: 'bg-emerald-500/15 text-emerald-400',
    title: '30% off',
    subtitle: 'Trading fees for your friend for 1 year',
  },
]

export type ShareTarget = {
  icon: LucideIcon
  label: string
}

/** "Share to" row — visual-only buttons. */
export const SHARE_TARGETS: ShareTarget[] = [
  { icon: Contact, label: 'Contact' },
  { icon: MessageCircle, label: 'Whatsapp' },
  { icon: Twitter, label: 'x' },
  { icon: Instagram, label: 'Instagram' },
  { icon: QrCode, label: 'QR Code' },
  { icon: MoreHorizontal, label: 'More' },
]
