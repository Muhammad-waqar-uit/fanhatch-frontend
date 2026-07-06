'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useNotificationsRealtime, useUnreadCount } from '../hooks'
import { NotificationDrawer } from './notification-drawer'
import { NotificationPopup } from './notification-popup'

/**
 * Header bell + unread badge. Mounts the realtime subscriber once, shows the
 * `total` unread count (capped at `99+`), and opens the desktop popup / mobile
 * drawer sharing the same panel.
 */
export function NotificationBell() {
  useNotificationsRealtime()
  const { data } = useUnreadCount()
  const [open, setOpen] = useState(false)
  const total = data?.total ?? 0
  const close = () => setOpen(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className={cn(
          'relative flex size-9 items-center justify-center rounded-full text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface-2)]',
          open && 'bg-[var(--color-surface-2)]',
        )}
      >
        <Bell className="size-5" />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold leading-4 text-[var(--color-accent-fg)]">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      <div className="hidden md:block">
        <NotificationPopup open={open} onClose={close} />
      </div>
      <div className="md:hidden">
        <NotificationDrawer open={open} onClose={close} />
      </div>
    </div>
  )
}
