'use client'

import { useEffect } from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { onNotificationCount, onNotificationNew } from '../lib/notifications-socket'
import { notificationKeys } from '../query-keys'
import {
  TAB_RELATED_TO,
  relatedToKey,
  type ListNotificationsParams,
  type Notification,
  type NotificationPage,
  type UnreadCount,
} from '../types'

/** Prepend a live notification into every relevant first-page list cache. */
function prependToLists(qc: QueryClient, notification: Notification) {
  for (const query of qc.getQueryCache().findAll({ queryKey: notificationKeys.lists() })) {
    const params = query.queryKey[query.queryKey.length - 1] as ListNotificationsParams
    // Only the first page, and never the "read only" view, and only matching tab.
    if ((params.page ?? 1) !== 1) continue
    if (params.read === true) continue
    if (params.tab && !TAB_RELATED_TO[params.tab].includes(notification.relatedTo)) continue

    qc.setQueryData<NotificationPage>(query.queryKey, (page) => {
      if (!page) return page
      if (page.items.some((n) => n.id === notification.id)) return page
      return {
        ...page,
        items: [notification, ...page.items],
        meta: { ...page.meta, total_record: page.meta.total_record + 1 },
      }
    })
  }
}

/** Optimistically bump one relatedTo bucket + total in the unread-count cache. */
function bumpUnread(qc: QueryClient, notification: Notification) {
  const key = relatedToKey(notification.relatedTo)
  qc.setQueryData<UnreadCount>(notificationKeys.unreadCount(), (count) =>
    count ? { ...count, [key]: count[key] + 1, total: count.total + 1 } : count,
  )
}

/**
 * Subscribes the header's bell to the `/notifications` socket. Mount once
 * (in `NotificationBell`). No-op in mock/SSR where the socket is null.
 * - `notification:new`  → prepend into list caches + bump unread badge.
 * - `notification:count` → replace the unread-count cache with server truth.
 */
export function useNotificationsRealtime() {
  const qc = useQueryClient()

  useEffect(() => {
    const offNew = onNotificationNew((notification) => {
      prependToLists(qc, notification)
      bumpUnread(qc, notification)
    })
    const offCount = onNotificationCount((count) => {
      qc.setQueryData(notificationKeys.unreadCount(), count)
    })
    return () => {
      offNew()
      offCount()
    }
  }, [qc])
}
