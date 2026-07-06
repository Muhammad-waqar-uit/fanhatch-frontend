/**
 * Mock data for the Wallet feature so the app renders with no backend
 * (NEXT_PUBLIC_USE_MOCKS=true). Values mirror the figma header/cards.
 */
import type { KeyHoldingDto, TokenQuote, WalletOverviewDto, WalletRewardsDto } from './types'

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

/**
 * Seeded CoinMarketCap quotes for mock/web2 mode. `getTokenQuotes` filters this
 * list to the requested symbols so the Tokens list renders with no backend.
 */
export const mockTokenQuotes: TokenQuote[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3000,
    percentChange24h: -2.4,
    marketCap: 361_000_000_000,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 62_000,
    percentChange24h: 1.8,
    marketCap: 1_220_000_000_000,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1,
    percentChange24h: 0.01,
    marketCap: 34_000_000_000,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
  },
]
