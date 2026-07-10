'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { getReferral, redeemReferral } from '../api/referrals.api'

/** The caller's referral code, link + stats. retry:false so logged-out falls back to mock values. */
export function useReferral() {
  return useQuery({ queryKey: ['referrals', 'me'], queryFn: getReferral, retry: false })
}

export function useRedeemReferral() {
  return useMutation({ mutationFn: (code: string) => redeemReferral(code) })
}
