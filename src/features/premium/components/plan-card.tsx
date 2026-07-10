'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/shared/lib/cn'
import type { Plan } from '../types'

/**
 * A single pricing column. The current plan gets a teal highlight ring and a
 * disabled "Current" CTA; upgradeable plans get a blue "Select Plan" button.
 */
export function PlanCard({
  plan,
  onSelect,
  pending = false,
}: {
  plan: Plan
  onSelect?: () => void
  pending?: boolean
}) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-5 p-5',
        plan.current
          ? 'border-2 border-[#2dd4bf] shadow-[0_0_0_1px_rgba(45,212,191,0.25)]'
          : 'border-[var(--color-border)]',
      )}
    >
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-[var(--color-accent)]">{plan.name}</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--color-accent)]">{plan.price}</div>
          <div className="text-xs text-[var(--color-muted)]">{plan.period}</div>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center justify-between gap-3 rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2.5"
          >
            <span className="text-sm text-[var(--color-fg)]">{feature}</span>
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]">
              <Check className="size-3.5 text-[var(--color-accent-fg)]" />
            </span>
          </li>
        ))}
      </ul>

      {plan.current ? (
        <Button
          variant="secondary"
          size="lg"
          disabled
          className="w-full text-[var(--color-accent)] disabled:opacity-100"
        >
          {plan.cta}
        </Button>
      ) : (
        <Button variant="primary" size="lg" className="w-full" onClick={onSelect} disabled={pending}>
          {pending ? 'Selecting…' : plan.cta}
        </Button>
      )}
    </Card>
  )
}
