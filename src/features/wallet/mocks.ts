/**
 * Mock data for the Wallet feature so the app renders with no backend
 * (NEXT_PUBLIC_USE_MOCKS=true). Values mirror the figma header/cards.
 */
import type { KeyHoldingDto, WalletOverviewDto, WalletRewardsDto } from './types'

/** Headline overview: net worth, $FANS price, balances, keys, rewards. */
export const mockOverview: WalletOverviewDto = {
  netWorthUsd: '125.86',
  change24hPct: -13,
  fansPriceUsd: '0.03',
  balances: {
    eth: '0.0342',
    ethUsd: '102.60',
    fans: '640.0000',
    fansUsd: '19.20',
  },
  keys: {
    count: 3,
    valueUsd: '4.06',
  },
  rewards: {
    farm: '12.4500',
    club: '3.2000',
  },
}

/** Creator-access keys the viewer holds. */
export const mockKeys: KeyHoldingDto[] = [
  {
    clubId: 'club-1',
    ftId: 'ft-1',
    name: 'Alice Creator',
    ticker: 'ALICE',
    keyCount: 2,
    keyPrice: '42.0000',
    valueUsd: '2.52',
  },
  {
    clubId: 'club-2',
    ftId: 'ft-2',
    name: 'Bob Builds',
    ticker: 'BOB',
    keyCount: 1,
    keyPrice: '51.3000',
    valueUsd: '1.54',
  },
]

/** Claimable reward pools + staked value for the "Your Farm" card. */
export const mockRewards: WalletRewardsDto = {
  farmRewards: '12.4500',
  clubRewards: '3.2000',
  claimable: '15.6500',
  stakedUsd: '48.20',
}
