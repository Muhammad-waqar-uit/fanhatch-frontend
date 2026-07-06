import type { ListNotificationsParams } from './types'

/**
 * Single source of truth for notification query keys. Hooks, the realtime
 * subscriber and cache patches all read keys from here so nothing drifts.
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: ListNotificationsParams) => [...notificationKeys.lists(), params] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
}
