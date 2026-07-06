'use client'

import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications.api'
import { notificationKeys } from '../query-keys'
import {
  relatedToKey,
  type Notification,
  type NotificationPage,
  type UnreadCount,
} from '../types'

/** Find a cached notification (from any list/detail cache) by id. */
function findCachedNotification(qc: QueryClient, id: string): Notification | undefined {
  const detail = qc.getQueryData<Notification>(notificationKeys.detail(id))
  if (detail) return detail
  for (const query of qc.getQueryCache().findAll({ queryKey: notificationKeys.lists() })) {
    const page = query.state.data as NotificationPage | undefined
    const hit = page?.items.find((n) => n.id === id)
    if (hit) return hit
  }
  return undefined
}

/** Apply a patch to a notification across every cached list + its detail cache. */
function patchNotificationEverywhere(qc: QueryClient, id: string, patch: Partial<Notification>) {
  qc.setQueriesData<NotificationPage>({ queryKey: notificationKeys.lists() }, (page) =>
    page
      ? { ...page, items: page.items.map((n) => (n.id === id ? { ...n, ...patch } : n)) }
      : page,
  )
  qc.setQueryData<Notification>(notificationKeys.detail(id), (n) => (n ? { ...n, ...patch } : n))
}

/** Remove a notification from every cached list. */
function removeNotificationEverywhere(qc: QueryClient, id: string) {
  qc.setQueriesData<NotificationPage>({ queryKey: notificationKeys.lists() }, (page) =>
    page
      ? {
          ...page,
          items: page.items.filter((n) => n.id !== id),
          meta: { ...page.meta, total_record: Math.max(0, page.meta.total_record - 1) },
        }
      : page,
  )
}

/** Decrement one relatedTo bucket (and total) in the unread-count cache, floored at 0. */
function decrementUnread(qc: QueryClient, notification: Notification) {
  if (notification.status !== 'UNREAD') return
  const key = relatedToKey(notification.relatedTo)
  qc.setQueryData<UnreadCount>(notificationKeys.unreadCount(), (count) =>
    count
      ? { ...count, [key]: Math.max(0, count[key] - 1), total: Math.max(0, count.total - 1) }
      : count,
  )
}

/** PATCH /notifications/:id/read — optimistic. */
export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all })
      const previous = qc.getQueryCache().getAll().map((q) => [q.queryKey, q.state.data] as const)
      const target = findCachedNotification(qc, id)
      if (target) decrementUnread(qc, target)
      patchNotificationEverywhere(qc, id, { status: 'READ', readAt: new Date().toISOString() })
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/** PATCH /notifications/read-all — optimistically zero every unread badge + row. */
export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all })
      const previous = qc.getQueryCache().getAll().map((q) => [q.queryKey, q.state.data] as const)
      const readAt = new Date().toISOString()
      qc.setQueriesData<NotificationPage>({ queryKey: notificationKeys.lists() }, (page) =>
        page
          ? {
              ...page,
              items: page.items.map((n) =>
                n.status === 'UNREAD' ? { ...n, status: 'READ', readAt } : n,
              ),
            }
          : page,
      )
      qc.setQueryData<UnreadCount>(notificationKeys.unreadCount(), (count) =>
        count
          ? {
              ...count,
              club: 0,
              key: 0,
              post: 0,
              chat: 0,
              gift: 0,
              vote: 0,
              swap: 0,
              stake: 0,
              user: 0,
              total: 0,
            }
          : count,
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/** DELETE /notifications/:id — optimistic soft-delete. */
export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all })
      const previous = qc.getQueryCache().getAll().map((q) => [q.queryKey, q.state.data] as const)
      const target = findCachedNotification(qc, id)
      if (target) decrementUnread(qc, target)
      removeNotificationEverywhere(qc, id)
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}
