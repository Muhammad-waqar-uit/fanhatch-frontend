'use client'

import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { NotificationPanel } from './notification-panel'

/** Mobile slide-in drawer from the right, with a dimmed backdrop. */
export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={cn('fixed inset-0 z-50', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-[var(--color-surface)] shadow-xl transition-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-[var(--radius)] p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <NotificationPanel onNavigate={onClose} />
        </div>
      </div>
    </div>
  )
}
