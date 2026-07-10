/**
 * Premium data access. Branches on env.useMocks: static plans in dev, else the
 * real /premium endpoints. `current`/`cta` are derived in the screen from the
 * caller's subscription, so getPlans returns them neutral.
 */
import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import { PLANS as STATIC_PLANS } from '../data'
import type { Plan, PlanId } from '../types'

interface ApiPlan {
  id: PlanId
  name: string
  price: number
  period: string
  features: string[]
}

export interface Subscription {
  plan: PlanId
  since: string | null
}

export async function getPlans(): Promise<Plan[]> {
  if (env.useMocks) return STATIC_PLANS
  const raw = (await apiClient.get('/premium/plans')) as unknown as ApiPlan[]
  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price === 0 ? '$0' : `$${p.price}`,
    period: p.period,
    features: p.features,
    current: false,
    cta: 'Select Plan',
  }))
}

export async function getSubscription(): Promise<Subscription> {
  if (env.useMocks) return { plan: 'free', since: null }
  return apiClient.get('/premium/subscription') as unknown as Promise<Subscription>
}

export async function subscribe(planId: PlanId): Promise<Subscription> {
  if (env.useMocks) return { plan: planId, since: null }
  return apiClient.post('/premium/subscribe', { planId }) as unknown as Promise<Subscription>
}

export interface StorageUsage {
  plan: PlanId
  usedBytes: number
  limitBytes: number
}

/** Media storage used vs the plan allowance (GET /media/usage). */
export async function getStorageUsage(): Promise<StorageUsage> {
  if (env.useMocks) return { plan: 'free', usedBytes: 0, limitBytes: 1024 ** 3 }
  return apiClient.get('/media/usage') as unknown as Promise<StorageUsage>
}
