'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
}

/**
 * Minimal accessible toggle (button role="switch"). Built on native elements so
 * the feature needs no extra dependency; styled with the app's theme tokens.
 */
export function Switch({ checked, onCheckedChange, disabled, id, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-2)]',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
