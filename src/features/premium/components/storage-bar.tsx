'use client'

import { useStorageUsage } from '../hooks/use-premium'

function fmtBytes(n: number): string {
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

/** Media storage used vs the plan allowance (GET /media/usage). Own-account only. */
export function StorageBar() {
  const { data } = useStorageUsage()
  if (!data) return null
  const pct = data.limitBytes > 0 ? Math.min(100, (data.usedBytes / data.limitBytes) * 100) : 0
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--color-fg)]">Media storage</span>
        <span className="text-[var(--color-muted)]">
          {fmtBytes(data.usedBytes)} of {fmtBytes(data.limitBytes)} · {data.plan} plan
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
