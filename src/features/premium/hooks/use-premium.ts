'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPlans, getSubscription, subscribe } from '../api/premium.api'
import type { PlanId } from '../types'

export function usePlans() {
  return useQuery({ queryKey: ['premium', 'plans'], queryFn: getPlans })
}

/** Caller's current plan. retry:false so a 401 (logged-out) just falls back to free. */
export function useSubscription() {
  return useQuery({ queryKey: ['premium', 'subscription'], queryFn: getSubscription, retry: false })
}

export function useSubscribe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: PlanId) => subscribe(planId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['premium', 'subscription'] }),
  })
}
