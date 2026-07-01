/**
 * Wallet data access. Branches on env.useMocks: returns local mocks for web2
 * dev, otherwise hits the backend via the shared apiClient. Endpoint paths
 * track the web2 contract (/wallet/*). All amounts are decimal strings.
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import { mockKeys, mockOverview, mockRewards } from '../mocks'
import type {
  ClaimRewardsResultDto,
  KeyHoldingDto,
  RewardType,
  WalletOverviewDto,
  WalletRewardsDto,
} from '../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

/** GET /wallet/overview */
export async function getOverview(): Promise<WalletOverviewDto> {
  if (env.useMocks) {
    await delay()
    return mockOverview
  }
  return apiClient.get('/wallet/overview') as unknown as Promise<WalletOverviewDto>
}

/** GET /wallet/keys */
export async function getKeys(): Promise<KeyHoldingDto[]> {
  if (env.useMocks) {
    await delay(200)
    return mockKeys
  }
  return apiClient.get('/wallet/keys') as unknown as Promise<KeyHoldingDto[]>
}

/** GET /wallet/rewards */
export async function getRewards(): Promise<WalletRewardsDto> {
  if (env.useMocks) {
    await delay(200)
    return mockRewards
  }
  return apiClient.get('/wallet/rewards') as unknown as Promise<WalletRewardsDto>
}

/** POST /wallet/rewards/claim — moves a reward pool into the $FANS balance. */
export async function claimRewards(type: RewardType): Promise<ClaimRewardsResultDto> {
  if (env.useMocks) {
    await delay(400)
    const claimed = type === 'farm' ? mockRewards.farmRewards : mockRewards.clubRewards
    const nextFans = Number(mockOverview.balances.fans) + Number(claimed)
    // Reflect the claim in the shared mock so a refetch surfaces the change.
    mockOverview.balances.fans = nextFans.toFixed(4)
    if (type === 'farm') {
      mockRewards.farmRewards = '0.0000'
      mockOverview.rewards.farm = '0.0000'
    } else {
      mockRewards.clubRewards = '0.0000'
      mockOverview.rewards.club = '0.0000'
    }
    mockRewards.claimable = (
      Number(mockRewards.farmRewards) + Number(mockRewards.clubRewards)
    ).toFixed(4)
    return { claimed, fansBalance: nextFans.toFixed(4) }
  }
  return apiClient.post('/wallet/rewards/claim', { type }) as unknown as Promise<ClaimRewardsResultDto>
}
