'use client'

import Link from 'next/link'
import { CheckCheck, Settings } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMarkAllRead, useNotifications, useUnreadCount } from '../hooks'
import { NotificationList } from './notification-list'

/**
 * Shared dropdown/drawer body: header (mark-all-read + settings), a scrollable
 * recent list, and a "View all" footer. Rendered by both the popup and drawer.
 */
export function NotificationPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isLoading } = useNotifications({ page: 1 })
  const { data: unread } = useUnreadCount()
  const markAll = useMarkAllRead()
  const hasUnread = (unread?.total ?? 0) > 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <span className="text-sm font-semibold">Notifications</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={!hasUnread || markAll.isPending}
            className="flex items-center gap-1 rounded-[var(--radius)] px-2 py-1 text-xs text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-40"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
          <Link
            href="/notifications/settings"
            onClick={onNavigate}
            aria-label="Notification settings"
            className="rounded-[var(--radius)] p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)]"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-1">
          <NotificationList
            notifications={data?.items}
            isLoading={isLoading}
            onNavigate={onNavigate}
          />
        </div>
      </ScrollArea>

      <div className="border-t border-[var(--color-border)] p-2">
        <Link
          href="/notifications"
          onClick={onNavigate}
          className="block rounded-[var(--radius)] py-2 text-center text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          View all
        </Link>
      </div>
    </div>
  )
}
