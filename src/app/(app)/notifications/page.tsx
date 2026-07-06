import { Suspense } from 'react'
import { NotificationListPage } from '@/features/notifications'

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationListPage />
    </Suspense>
  )
}
