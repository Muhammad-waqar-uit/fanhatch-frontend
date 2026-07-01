/**
 * Create Club data access. Branches on env.useMocks: returns a fake ClubDto for
 * web2 dev, otherwise POSTs to the backend via the shared apiClient. Endpoint
 * paths track the contract (/clubs).
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import { makeMockClub } from '../mocks'
import type { ClubDto, CreateClubInput, CurveType } from '../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

/** Base price of the first key (matches the web2 curve helper). */
const BASE_PRICE = 0.01

/**
 * Pure web2 curve estimate (mirrors the server helper). `supply` is the member
 * index `n` to price at (the picker asks for 50).
 * - casual:    base + 0.001·n
 * - standard:  base + 0.004·n
 * - exclusive: base · 1.008^n
 */
export function estimatePrice(curveType: CurveType, supply: number): number {
  const n = Math.max(0, supply)
  switch (curveType) {
    case 'casual':
      return BASE_PRICE + 0.001 * n
    case 'standard':
      return BASE_PRICE + 0.004 * n
    case 'exclusive':
      return BASE_PRICE * Math.pow(1.008, n)
  }
}

/** POST /clubs → ClubDto (creator auto-holds key 1, chat room created). */
export async function createClub(input: CreateClubInput): Promise<ClubDto> {
  if (env.useMocks) {
    await delay()
    return makeMockClub(input)
  }
  return apiClient.post('/clubs', input) as unknown as Promise<ClubDto>
}
