'use client'

import { BellOff } from 'lucide-react'
import { NotificationItem } from './notification-item'
import type { Notification } from '../types'

function ItemSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <div className="size-[52px] shrink-0 animate-pulse rounded-full bg-[var(--color-surface-2)]" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-surface-2)]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-surface-2)]" />
      </div>
    </div>
  )
}

/** Shared list body used by the popup, drawer and full list page. */
export function NotificationList({
  notifications,
  isLoading,
  onNavigate,
  emptyLabel = 'No notifications yet',
}: {
  notifications: Notification[] | undefined
  isLoading?: boolean
  onNavigate?: () => void
  emptyLabel?: string
}) {
  if (isLoading && !notifications?.length) {
    return (
      <div>
        {Array.from({ length: 4 }).map((_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
        <BellOff className="size-8 text-[var(--color-muted)]" />
        <p className="text-sm text-[var(--color-muted)]">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />
      ))}
    </div>
  )
}
