/**
 * Club data access. Branches on env.useMocks: local mock in dev, else the real
 * /clubs/:id endpoints (apiClient unwraps the `{success,data}` envelope).
 */
import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import { MOCK_CLUB, MOCK_PRESIDENT, delay } from '../mocks'
import type { Club, ClubPresidentState } from '../types'

export async function getClub(id: string): Promise<Club> {
  if (env.useMocks) {
    await delay()
    return MOCK_CLUB
  }
  return apiClient.get(`/clubs/${id}`) as unknown as Promise<Club>
}

export async function getClubPresident(id: string): Promise<ClubPresidentState> {
  if (env.useMocks) {
    await delay(200)
    return MOCK_PRESIDENT
  }
  return apiClient.get(`/clubs/${id}/president`) as unknown as Promise<ClubPresidentState>
}

/** Web2 buy simulation (JWT). Returns the updated club shape. */
export async function buyClubKey(id: string, amount = 1): Promise<unknown> {
  if (env.useMocks) {
    await delay(300)
    return { ok: true }
  }
  return apiClient.post(`/clubs/${id}/keys/buy`, { amount })
}
