import { Card } from '@/components/ui/card'
import { SHARE_TARGETS } from '../data'

/** "Share to" row — visual-only share buttons (figma). */
export function ShareTo() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-fg)]">Share to</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {SHARE_TARGETS.map(({ icon: Icon, label }) => (
          <Card
            key={label}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 py-5 transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <Icon className="size-6 text-[var(--color-fg)]" />
            <span className="text-xs text-[var(--color-muted)]">{label}</span>
          </Card>
        ))}
      </div>
    </section>
  )
}
