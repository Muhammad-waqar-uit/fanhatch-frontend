import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import { mockNotificationSeed, mockSettingsSeed } from '../mocks'
import {
  TAB_RELATED_TO,
  relatedToKey,
  type ListNotificationsParams,
  type Notification,
  type NotificationDto,
  type NotificationPage,
  type NotificationPageDto,
  type NotificationSetting,
  type NotificationSettingType,
  type UnreadCount,
  type UnreadCountKey,
} from '../types'

/** Small artificial delay so mock loading states are observable. */
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

/** Map a backend notification DTO onto the feature's `Notification`. */
export function mapNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: dto.type,
    relatedTo: dto.relatedTo,
    status: dto.status,
    title: dto.title,
    body: dto.body ?? undefined,
    data: dto.data ?? {},
    createdAt: dto.createdAt,
    readAt: dto.readAt ?? null,
  }
}

const EMPTY_UNREAD: UnreadCount = {
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

// --- Mock store (mutable so mark-read / delete persist within a session) -----

const mockStore: Notification[] = mockNotificationSeed.map((n) => ({ ...n, data: { ...n.data } }))
const mockSettings: NotificationSetting[] = mockSettingsSeed.map((s) => ({ ...s }))

const visibleMock = () => mockStore.filter((n) => n.status !== 'DELETED')

function mockUnreadCount(): UnreadCount {
  const count: UnreadCount = { ...EMPTY_UNREAD }
  for (const n of visibleMock()) {
    if (n.status !== 'UNREAD') continue
    const key = relatedToKey(n.relatedTo)
    count[key] += 1
    count.total += 1
  }
  return count
}

// --- Endpoints --------------------------------------------------------------

/** GET /notifications?relatedTo[]=&page=&limit=&read= */
export async function getNotifications(
  params: ListNotificationsParams = {},
): Promise<NotificationPage> {
  const { tab, page = 1, limit = 15, read } = params

  if (env.useMocks) {
    const related = tab ? TAB_RELATED_TO[tab] : null
    const filtered = visibleMock()
      .filter((n) => (related ? related.includes(n.relatedTo) : true))
      .filter((n) => (read === undefined ? true : read ? n.status === 'READ' : n.status === 'UNREAD'))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    const total = filtered.length
    const start = (page - 1) * limit
    const items = filtered.slice(start, start + limit).map((n) => ({ ...n, data: { ...n.data } }))
    return delay({
      items,
      meta: {
        total_page: Math.max(1, Math.ceil(total / limit)),
        current_page: page,
        limit,
        total_record: total,
      },
    })
  }

  const dto = await apiClient.get<unknown, NotificationPageDto>('/notifications', {
    params: {
      relatedTo: tab ? TAB_RELATED_TO[tab] : undefined,
      page,
      limit,
      read,
    },
  })
  return { items: dto.data.map(mapNotification), meta: dto.meta }
}

/** GET /notifications/unread-count */
export async function getUnreadCount(): Promise<UnreadCount> {
  if (env.useMocks) return delay(mockUnreadCount())
  return apiClient.get<unknown, UnreadCount>('/notifications/unread-count')
}

/** GET /notifications/:id */
export async function getNotification(id: string): Promise<Notification> {
  if (env.useMocks) {
    const found = mockStore.find((n) => n.id === id && n.status !== 'DELETED')
    if (!found) return Promise.reject(new Error('Notification not found'))
    return delay({ ...found, data: { ...found.data } })
  }
  const dto = await apiClient.get<unknown, NotificationDto>(`/notifications/${id}`)
  return mapNotification(dto)
}

/** PATCH /notifications/:id/read */
export async function markNotificationRead(id: string): Promise<Notification> {
  if (env.useMocks) {
    const found = mockStore.find((n) => n.id === id)
    if (found && found.status === 'UNREAD') {
      found.status = 'READ'
      found.readAt = new Date().toISOString()
    }
    if (!found) return Promise.reject(new Error('Notification not found'))
    return delay({ ...found, data: { ...found.data } }, 0)
  }
  const dto = await apiClient.patch<unknown, NotificationDto>(`/notifications/${id}/read`)
  return mapNotification(dto)
}

/** PATCH /notifications/read-all */
export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  if (env.useMocks) {
    let updated = 0
    for (const n of visibleMock()) {
      if (n.status === 'UNREAD') {
        n.status = 'READ'
        n.readAt = new Date().toISOString()
        updated += 1
      }
    }
    return delay({ updated }, 0)
  }
  return apiClient.patch<unknown, { updated: number }>('/notifications/read-all')
}

/** DELETE /notifications/:id — soft delete (status → DELETED). */
export async function deleteNotification(id: string): Promise<{ success: true }> {
  if (env.useMocks) {
    const found = mockStore.find((n) => n.id === id)
    if (found) found.status = 'DELETED'
    return delay({ success: true } as const, 0)
  }
  return apiClient.delete<unknown, { success: true }>(`/notifications/${id}`)
}

/** GET /notifications/settings */
export async function getNotificationSettings(): Promise<NotificationSetting[]> {
  if (env.useMocks) return delay(mockSettings.map((s) => ({ ...s })))
  return apiClient.get<unknown, NotificationSetting[]>('/notifications/settings')
}

/** PATCH /notifications/settings */
export async function updateNotificationSetting(params: {
  type: NotificationSettingType
  status: boolean
}): Promise<NotificationSetting> {
  if (env.useMocks) {
    const found = mockSettings.find((s) => s.type === params.type)
    if (found) found.status = params.status
    else mockSettings.push({ ...params })
    return delay({ ...params }, 0)
  }
  return apiClient.patch<unknown, NotificationSetting>('/notifications/settings', params)
}

export type { UnreadCountKey }
