import {
  Home,
  MessageCircle,
  Wallet,
  Bell,
  Compass,
  Bookmark,
  Droplets,
  Crown,
  Gift,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** false = screen specced/planned but not built yet (rendered as a stub). */
  ready?: boolean
}

/** Left navigation from the figma. Home (dashboard) + Chat are built; others are stubs for now. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, ready: true },
  { label: 'Chat', href: '/chat', icon: MessageCircle, ready: true },
  { label: 'Wallet', href: '/wallet', icon: Wallet, ready: true },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { label: 'LP', href: '/lp', icon: Droplets, ready: true },
  { label: 'Premium', href: '/premium', icon: Crown },
  { label: 'Referrals', href: '/referrals', icon: Gift },
]
