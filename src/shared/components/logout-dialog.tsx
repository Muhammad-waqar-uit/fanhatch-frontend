'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Logout confirmation modal (figma "Logout / Are you sure you want to logout?").
 * Dependency-free overlay (Radix Dialog isn't installed) — matches the app's
 * other lightweight dialogs: fixed overlay, Escape / overlay-click to close.
 */
export function LogoutDialog({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Log out"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-[var(--color-fg)]">Logout</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-[var(--color-muted)]">Are you sure you want to logout?</p>

        <Button variant="primary" className="mt-8 w-full" onClick={onConfirm}>
          Logout
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-center text-sm font-medium text-[var(--color-fg)] transition-colors hover:text-[var(--color-muted)]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
