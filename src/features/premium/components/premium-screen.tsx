'use client'

/**
 * Premium / pricing screen: "Select a plan" with three plan columns and a
 * "Why Upgrade?" section. Plans come from GET /premium/plans; the caller's
 * current plan (from /premium/subscription) is highlighted, and Select Plan
 * records the tier via POST /premium/subscribe.
 */
import { usePlans, useSubscribe, useSubscription } from '../hooks/use-premium'
import { PlanCard } from './plan-card'
import { WhyUpgrade } from './why-upgrade'

export function PremiumScreen() {
  const { data: plans = [] } = usePlans()
  const { data: subscription } = useSubscription()
  const subscribe = useSubscribe()
  const currentPlan = subscription?.plan ?? 'free'

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--color-fg)]">Select a plan</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Upgrade your Fans.tech experience today
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const current = plan.id === currentPlan
            return (
              <PlanCard
                key={plan.id}
                plan={{ ...plan, current, cta: current ? 'Current' : 'Select Plan' }}
                pending={subscribe.isPending && subscribe.variables === plan.id}
                onSelect={() => subscribe.mutate(plan.id)}
              />
            )
          })}
        </div>

        <WhyUpgrade />
      </div>
    </div>
  )
}
