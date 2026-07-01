'use client'

import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface AssetCardAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  icon?: LucideIcon
}

/**
 * Reusable wallet asset tile — used for Ethereum (ETH), $FANS (Platform Token),
 * and Keys (Creator Access). Shows an icon + title/subtitle header, a primary
 * value with an optional secondary line, and a row of action buttons.
 */
export function AssetCard({
  icon: Icon,
  title,
  subtitle,
  value,
  secondary,
  actions,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  value: string
  secondary?: string
  actions: AssetCardAction[]
}) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-fg)]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{title}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
        </div>
      </div>

      <div>
        <p className="text-xl font-semibold text-[var(--color-fg)]">{value}</p>
        {secondary ? <p className="text-xs text-[var(--color-muted)]">{secondary}</p> : null}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? 'secondary'}
            size="sm"
            onClick={action.onClick}
          >
            {action.icon ? <action.icon /> : null}
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
