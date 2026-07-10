/** UI-only types for the Premium / pricing screen. No backend involved. */

export type PlanId = 'free' | 'premium' | 'pro'

export interface Plan {
  id: PlanId
  name: string
  price: string
  /** Billing cadence copy shown under the price (e.g. "Forever", "Per year"). */
  period: string
  features: string[]
  /** The current plan is highlighted and shows a disabled "Current" CTA. */
  current: boolean
  cta: string
}

export interface UpgradeReason {
  title: string
  description: string
}
