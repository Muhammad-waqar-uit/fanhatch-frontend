'use client'

import { NotificationPanel } from './notification-panel'

/** Desktop dropdown anchored under the bell. Renders nothing when closed. */
export function NotificationPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <>
      {/* Click-away layer. */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[70vh] w-96 flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
        <NotificationPanel onNavigate={onClose} />
      </div>
    </>
  )
}
