/**
 * Referrals data access. Branches on env.useMocks: static figma values in dev,
 * else the real /referrals endpoints (JWT). retry is left to the hook.
 */
import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import { REFERRAL_CODE, REFERRAL_LINK } from '../data'

export interface ReferralMe {
  code: string
  link: string
  rewards: { key: string; label: string; sub: string }[]
  stats: { invited: number; rewardsUsdt: number; tokenBonus: number }
}

export async function getReferral(): Promise<ReferralMe> {
  if (env.useMocks) {
    return {
      code: REFERRAL_CODE,
      link: REFERRAL_LINK,
      rewards: [],
      stats: { invited: 0, rewardsUsdt: 0, tokenBonus: 0 },
    }
  }
  return apiClient.get('/referrals/me') as unknown as Promise<ReferralMe>
}

/** Apply a referrer's code (one-time). Available for a /join flow; the screen is share-only. */
export async function redeemReferral(code: string): Promise<{ success: boolean }> {
  if (env.useMocks) return { success: true }
  return apiClient.post('/referrals/redeem', { code }) as unknown as Promise<{ success: boolean }>
}
