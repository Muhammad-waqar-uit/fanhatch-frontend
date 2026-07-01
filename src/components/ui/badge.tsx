import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'positive' | 'negative' | 'accent' }) {
  const tones = {
    neutral: 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
    positive: 'bg-[var(--color-positive)]/15 text-[var(--color-positive)]',
    negative: 'bg-[var(--color-negative)]/15 text-[var(--color-negative)]',
    accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
  }
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  )
}
