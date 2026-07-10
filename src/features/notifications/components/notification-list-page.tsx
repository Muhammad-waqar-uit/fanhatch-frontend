'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCheck, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useMarkAllRead, useNotifications, useUnreadCount } from '../hooks'
import {
  NOTIFICATION_TABS,
  TAB_LABELS,
  TAB_UNREAD_KEYS,
  type NotificationTab,
  type UnreadCount,
} from '../types'
import { NotificationList } from './notification-list'

/** Sum the unread-count buckets that belong to a tab. */
function tabUnread(count: UnreadCount | undefined, tab: NotificationTab): number {
  if (!count) return 0
  return TAB_UNREAD_KEYS[tab].reduce((sum, key) => sum + count[key], 0)
}

function isTab(value: string | null): value is NotificationTab {
  return !!value && (NOTIFICATION_TABS as readonly string[]).includes(value)
}

/** Full-page notifications view: URL-driven tabs, per-tab unread, pagination. */
export function NotificationListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: NotificationTab = isTab(tabParam) ? tabParam : 'clubs'
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  const { data, isLoading, isFetching } = useNotifications({ tab, page })
  const { data: unread } = useUnreadCount()
  const markAll = useMarkAllRead()

  const setParams = (next: { tab?: NotificationTab; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next.tab) params.set('tab', next.tab)
    params.set('page', String(next.page ?? 1))
    router.push(`/notifications?${params.toString()}`)
  }

  const totalPages = data?.meta.total_page ?? 1
  const hasUnread = (unread?.total ?? 0) > 0

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={!hasUnread || markAll.isPending}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Notification settings">
            <Link href="/notifications/settings">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v as NotificationTab, page: 1 })}>
        <TabsList className="mt-2 w-full px-2">
          {NOTIFICATION_TABS.map((t) => {
            const count = tabUnread(unread, t)
            return (
              <TabsTrigger key={t} value={t} className="flex items-center gap-1.5">
                {TAB_LABELS[t]}
                {count > 0 && (
                  <span className="flex min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold leading-4 text-[var(--color-accent-fg)]">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <div className={cn('min-h-0 flex-1 overflow-y-auto p-2', isFetching && 'opacity-80')}>
        <NotificationList
          notifications={data?.items}
          isLoading={isLoading}
          emptyLabel={`No ${TAB_LABELS[tab].toLowerCase()} notifications`}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParams({ tab, page: page - 1 })}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="text-xs text-[var(--color-muted)]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setParams({ tab, page: page + 1 })}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
