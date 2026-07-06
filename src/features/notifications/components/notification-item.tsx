'use client'

import Link from 'next/link'
import { formatRelative } from 'date-fns'
import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/shared/lib/cn'
import { NOTIFICATION_CONFIG } from '../config'
import { useMarkRead } from '../hooks'
import type { Notification } from '../types'

/** Capitalise the first letter of date-fns' relative string ("today at 3pm"). */
function relativeTime(iso: string): string {
  const s = formatRelative(new Date(iso), new Date())
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * One notification row. Fully config-driven (icon / accent / title / body /
 * href from `NOTIFICATION_CONFIG`). 52px avatar-or-Bell, unread dot,
 * `font-semibold` unread vs `opacity-70` read; click marks read + deep-links.
 */
export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: Notification
  onNavigate?: () => void
}) {
  const cfg = NOTIFICATION_CONFIG[notification.type]
  const markRead = useMarkRead()
  const Icon = cfg.icon
  const unread = notification.status === 'UNREAD'
  const title = notification.title || cfg.title(notification.data)
  const body = notification.body ?? cfg.body(notification.data)
  const avatarUrl = notification.data.actorAvatarUrl

  const handleClick = () => {
    if (unread) markRead.mutate(notification.id)
    onNavigate?.()
  }

  return (
    <Link
      href={cfg.href(notification.data)}
      onClick={handleClick}
      className={cn(
        'flex gap-3 rounded-[var(--radius)] p-3 transition-colors hover:bg-[var(--color-surface-2)]',
        !unread && 'opacity-70',
      )}
    >
      <div className="relative size-[52px] shrink-0">
        {avatarUrl ? (
          <Avatar className="size-[52px]">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback>
              <Icon className={cn('size-5', cfg.accent)} />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex size-[52px] items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <Icon className={cn('size-5', cfg.accent || 'text-[var(--color-muted)]')} />
          </div>
        )}
        {/* Type badge overlay when an avatar is shown, so the icon stays visible. */}
        {avatarUrl && (
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border border-[var(--color-surface)] bg-[var(--color-surface)]">
            <Icon className={cn('size-3', cfg.accent)} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm text-[var(--color-fg)]', unread && 'font-semibold')}>{title}</p>
        {body && <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-muted)]">{body}</p>}
        <p className="mt-1 text-[11px] text-[var(--color-muted)]">{relativeTime(notification.createdAt)}</p>
      </div>

      {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-accent)]" />}
    </Link>
  )
}
