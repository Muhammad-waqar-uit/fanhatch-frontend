import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'
import { mapNotification } from '../api/notifications.api'
import type { Notification, NotificationDto, UnreadCount } from '../types'

/** Server → client event names for the `/notifications` namespace. */
export const NotificationSocketEvents = {
  New: 'notification:new',
  Count: 'notification:count',
} as const

export interface NotificationServerToClientEvents {
  'notification:new': (dto: NotificationDto) => void
  'notification:count': (count: UnreadCount) => void
}

export type NotificationsSocket = Socket<NotificationServerToClientEvents>

let socket: NotificationsSocket | null = null

/**
 * Lazily creates (and reuses) the `/notifications` socket.io connection.
 * Returns `null` in mock mode and during SSR so no real connection is opened —
 * mirrors `features/chat/lib/socket.ts`.
 */
export function getNotificationsSocket(): NotificationsSocket | null {
  if (env.useMocks) return null
  if (typeof window === 'undefined') return null

  if (!socket) {
    socket = io(`${env.wsUrl}/notifications`, {
      auth: { token: localStorage.getItem('accessToken') },
      autoConnect: true,
    })
  }
  return socket
}

/** Subscribe to newly pushed notifications. Returns an unsubscribe fn (no-op in mock/SSR). */
export function onNotificationNew(cb: (notification: Notification) => void): () => void {
  const s = getNotificationsSocket()
  if (!s) return () => {}
  const handler = (dto: NotificationDto): void => cb(mapNotification(dto))
  s.on(NotificationSocketEvents.New, handler)
  return () => {
    s.off(NotificationSocketEvents.New, handler)
  }
}

/** Subscribe to authoritative unread-count pushes. Returns an unsubscribe fn (no-op in mock/SSR). */
export function onNotificationCount(cb: (count: UnreadCount) => void): () => void {
  const s = getNotificationsSocket()
  if (!s) return () => {}
  s.on(NotificationSocketEvents.Count, cb)
  return () => {
    s.off(NotificationSocketEvents.Count, cb)
  }
}

/** Tear down the active connection (e.g. on logout). */
export function disconnectNotificationsSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
