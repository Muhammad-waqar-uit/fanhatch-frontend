'use client'

import Link from 'next/link'
import { BadgeCheck, Gem } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/datetime'
import { NOTIFICATION_CONFIG } from '../config'
import { useMarkRead } from '../hooks'
import type { Notification } from '../types'

/**
 * One notification row, styled after the figma reference: a rounded card with an
 * avatar carrying an overlapped colored type-icon badge, a "Username [badges]
 * @handle" header with a right-aligned time, a one-line action, an optional
 * money chip (e.g. a "$25" tip) and a teal unread dot. Fully config-driven
 * (icon / accent / action / chip / href from `NOTIFICATION_CONFIG`); click marks
 * read + deep-links.
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
  const data = notification.data
  const avatarUrl = data.actorAvatarUrl

  // Header name: the actor when we know one, else the notification title.
  const hasActor = !!data.actorName
  const name = data.actorName ?? (notification.title || cfg.title(data))
  const handle = data.actorHandle ?? data.creatorHandle
  const body = notification.body ?? cfg.body(data)
  const action = (hasActor ? cfg.action?.(data) : undefined) ?? body
  const chip = cfg.chip?.(data)

  const handleClick = () => {
    if (unread) markRead.mutate(notification.id)
    onNavigate?.()
  }

  return (
    <Link
      href={cfg.href(data)}
      onClick={handleClick}
      className="flex items-center gap-3 rounded-[var(--radius)] bg-[var(--color-surface)] p-3.5 transition-colors hover:bg-[var(--color-surface-2)]"
    >
      <div className="relative size-11 shrink-0 self-start">
        {avatarUrl ? (
          <Avatar className="size-11">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback>
              <Icon className={cn('size-5', cfg.accent)} />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <Icon className={cn('size-5', cfg.accent || 'text-[var(--color-muted)]')} />
          </div>
        )}
        {/* Colored type-icon badge overlapped on the avatar's bottom-right. */}
        <span className="absolute -bottom-1 -right-1 flex size-[18px] items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-2)]">
          <Icon className={cn('size-2.5', cfg.accent || 'text-[var(--color-muted)]')} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-[var(--color-fg)]">{name}</span>
          {hasActor && (
            <>
              <Gem className="size-3.5 shrink-0 text-[var(--color-accent)]" />
              <BadgeCheck className="size-3.5 shrink-0 text-[#2dd4bf]" />
            </>
          )}
          {handle && (
            <span className="truncate text-xs text-[var(--color-muted)]">@{handle}</span>
          )}
          <span className="ml-auto shrink-0 pl-2 text-xs text-[var(--color-muted)]">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        {action && (
          <p className="mt-0.5 line-clamp-1 text-sm text-[var(--color-muted)]">{action}</p>
        )}
        {chip && (
          <span className="mt-1 inline-flex items-center rounded-md bg-[var(--color-surface-2)] px-2 py-0.5 text-xs font-medium text-[#2dd4bf]">
            {chip}
          </span>
        )}
      </div>

      <span
        className={cn(
          'size-2 shrink-0 self-center rounded-full',
          unread ? 'bg-[#2dd4bf]' : 'bg-transparent',
        )}
      />
    </Link>
  )
}
