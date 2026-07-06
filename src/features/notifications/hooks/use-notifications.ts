'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { env } from '@/config/env'
import { getNotification, getNotifications, getUnreadCount } from '../api/notifications.api'
import { notificationKeys } from '../query-keys'
import type { ListNotificationsParams } from '../types'

/**
 * GET /notifications/unread-count — per-tab tallies + `total`. A slow 60s
 * `refetchInterval` acts only as a fallback; the socket is the primary channel.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: env.useMocks ? false : 60_000,
  })
}

/** GET /notifications — paginated, filtered by tab + read state. */
export function useNotifications(params: ListNotificationsParams = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    placeholderData: keepPreviousData,
  })
}

/** GET /notifications/:id — single notification detail. */
export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => getNotification(id),
    enabled: Boolean(id),
  })
}
