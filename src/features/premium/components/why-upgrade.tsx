import { Card } from '@/components/ui/card'
import { UPGRADE_INTRO, UPGRADE_REASONS } from '../data'

/**
 * "Why Upgrade?" section: a mission blurb on the left and a list of
 * teal-accented feature cards on the right.
 */
export function WhyUpgrade() {
  return (
    <Card className="p-6 md:p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-[var(--color-fg)]">Why Upgrade?</h2>
          {UPGRADE_INTRO.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-[var(--color-muted)]">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {UPGRADE_REASONS.map((reason) => (
            <div
              key={reason.title}
              className="rounded-[var(--radius)] border-l-2 border-[#2dd4bf] bg-[var(--color-surface-2)] p-4"
            >
              <h3 className="text-base font-semibold text-[var(--color-fg)]">{reason.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
