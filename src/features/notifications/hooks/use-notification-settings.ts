'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotificationSettings, updateNotificationSetting } from '../api/notifications.api'
import { notificationKeys } from '../query-keys'
import type { NotificationSetting, NotificationSettingType } from '../types'

/** GET /notifications/settings — per-category toggle state. */
export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: getNotificationSettings,
  })
}

/** PATCH /notifications/settings — optimistic toggle with rollback. */
export function useUpdateSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { type: NotificationSettingType; status: boolean }) =>
      updateNotificationSetting(params),
    onMutate: async (params) => {
      await qc.cancelQueries({ queryKey: notificationKeys.settings() })
      const previous = qc.getQueryData<NotificationSetting[]>(notificationKeys.settings())
      qc.setQueryData<NotificationSetting[]>(notificationKeys.settings(), (old) =>
        (old ?? []).map((s) => (s.type === params.type ? { ...s, status: params.status } : s)),
      )
      return { previous }
    },
    onError: (_err, _params, ctx) => {
      if (ctx?.previous) qc.setQueryData(notificationKeys.settings(), ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.settings() })
    },
  })
}
