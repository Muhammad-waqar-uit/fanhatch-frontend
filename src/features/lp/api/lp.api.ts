/**
 * LP data access. Branches on env.useMocks: drives an in-memory AMM for web2
 * dev, otherwise hits the backend via the shared apiClient. Endpoint paths
 * track the contract (/lp/*). All amounts are decimal strings.
 */
import { isAxiosError } from 'axios'
import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import {
  amountOut,
  fansPriceUsd,
  mockBalances,
  mockFarm,
  mockLpState,
  mockPool,
  priceImpact,
  readMockFarm,
  readMockPool,
  readMockPosition,
} from '../mocks'
import type {
  AddLiquidityResult,
  ClaimResult,
  Farm,
  LpPosition,
  Pool,
  QuoteInput,
  RemoveLiquidityResult,
  SwapDirection,
  SwapQuote,
  SwapResult,
} from '../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/** Shape a mock rejection like an axios 400 so components handle it uniformly. */
function insufficient(message: string): never {
  throw { isAxiosError: true, response: { status: 400, data: { message } } }
}

/**
 * Pull a human-readable message out of an API/mock error. Insufficient-balance
 * (400) responses carry a `message`; everything else gets a generic fallback.
 */
export function lpErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const err = error as { response?: { status?: number; data?: { message?: string } } }
  const msg = err?.response?.data?.message
  if (typeof msg === 'string' && msg) return msg
  if (isAxiosError(error) && error.message) return error.message
  return fallback
}

export async function getPool(): Promise<Pool> {
  if (env.useMocks) {
    await delay(200)
    return readMockPool()
  }
  return apiClient.get('/lp/pool') as unknown as Promise<Pool>
}

export async function getPosition(): Promise<LpPosition> {
  if (env.useMocks) {
    await delay(200)
    return readMockPosition()
  }
  return apiClient.get('/lp/position') as unknown as Promise<LpPosition>
}

export async function getFarm(): Promise<Farm> {
  if (env.useMocks) {
    await delay(200)
    return readMockFarm()
  }
  return apiClient.get('/lp/farm') as unknown as Promise<Farm>
}

export async function quote(input: QuoteInput): Promise<SwapQuote> {
  if (env.useMocks) {
    await delay(150)
    if (input.action === 'swap') {
      const amountIn = Number(input.amountIn ?? 0)
      const direction: SwapDirection = input.direction ?? 'eth_to_fans'
      const [reserveIn, reserveOut] =
        direction === 'eth_to_fans'
          ? [mockPool.reserveEth, mockPool.reserveFans]
          : [mockPool.reserveFans, mockPool.reserveEth]
      return {
        amountOut: amountOut(amountIn, reserveIn, reserveOut).toFixed(8),
        priceImpactPct: priceImpact(amountIn, direction),
      }
    }
    // add-liquidity quote: shares minted ∝ ethIn / reserveEth.
    const ethIn = Number(input.ethIn ?? 0)
    const frac = mockPool.reserveEth > 0 ? ethIn / mockPool.reserveEth : 0
    return { sharesOut: (frac * mockPool.totalShares).toFixed(8) }
  }
  return apiClient.post('/lp/quote', input) as unknown as Promise<SwapQuote>
}

export async function addLiquidity(ethIn: string, fansIn: string): Promise<AddLiquidityResult> {
  if (env.useMocks) {
    await delay(400)
    const eth = Number(ethIn)
    const fans = Number(fansIn)
    if (eth <= 0 || fans <= 0) insufficient('Enter an amount of ETH and $FANS')
    if (eth > mockBalances.eth) insufficient('Insufficient ETH balance')
    if (fans > mockBalances.fans) insufficient('Insufficient $FANS balance')
    const minted = mockPool.reserveEth > 0 ? (eth / mockPool.reserveEth) * mockPool.totalShares : eth
    mockBalances.eth -= eth
    mockBalances.fans -= fans
    mockPool.reserveEth += eth
    mockPool.reserveFans += fans
    mockPool.totalShares += minted
    mockLpState.shares += minted
    return { shares: minted.toFixed(8), position: readMockPosition() }
  }
  return apiClient.post('/lp/add', { ethIn, fansIn }) as unknown as Promise<AddLiquidityResult>
}

export async function removeLiquidity(shares: string): Promise<RemoveLiquidityResult> {
  if (env.useMocks) {
    await delay(400)
    const s = Number(shares)
    if (s <= 0) insufficient('Enter an amount of shares to remove')
    if (s > mockLpState.shares) insufficient('Insufficient LP shares')
    const frac = mockPool.totalShares > 0 ? s / mockPool.totalShares : 0
    const ethOut = frac * mockPool.reserveEth
    const fansOut = frac * mockPool.reserveFans
    mockPool.reserveEth -= ethOut
    mockPool.reserveFans -= fansOut
    mockPool.totalShares -= s
    mockLpState.shares -= s
    mockBalances.eth += ethOut
    mockBalances.fans += fansOut
    return { ethOut: ethOut.toFixed(8), fansOut: fansOut.toFixed(8) }
  }
  return apiClient.post('/lp/remove', { shares }) as unknown as Promise<RemoveLiquidityResult>
}

export async function swap(
  direction: SwapDirection,
  amountIn: string,
  minOut?: string,
): Promise<SwapResult> {
  if (env.useMocks) {
    await delay(400)
    const amt = Number(amountIn)
    if (amt <= 0) insufficient('Enter an amount to swap')
    const [reserveIn, reserveOut] =
      direction === 'eth_to_fans'
        ? [mockPool.reserveEth, mockPool.reserveFans]
        : [mockPool.reserveFans, mockPool.reserveEth]
    const bal = direction === 'eth_to_fans' ? mockBalances.eth : mockBalances.fans
    if (amt > bal) insufficient(`Insufficient ${direction === 'eth_to_fans' ? 'ETH' : '$FANS'} balance`)
    const out = amountOut(amt, reserveIn, reserveOut)
    if (minOut && out < Number(minOut)) insufficient('Slippage too high')
    if (direction === 'eth_to_fans') {
      mockBalances.eth -= amt
      mockBalances.fans += out
      mockPool.reserveEth += amt
      mockPool.reserveFans -= out
    } else {
      mockBalances.fans -= amt
      mockBalances.eth += out
      mockPool.reserveFans += amt
      mockPool.reserveEth -= out
    }
    return { amountOut: out.toFixed(8), pool: readMockPool() }
  }
  return apiClient.post('/lp/swap', { direction, amountIn, minOut }) as unknown as Promise<SwapResult>
}

export async function stake(shares: string): Promise<Farm> {
  if (env.useMocks) {
    await delay(400)
    const s = Number(shares)
    if (s <= 0) insufficient('Enter an amount of LP to stake')
    if (s > mockLpState.shares) insufficient('Insufficient LP shares')
    mockLpState.shares -= s
    mockFarm.staked += s
    return readMockFarm()
  }
  return apiClient.post('/lp/farm/stake', { shares }) as unknown as Promise<Farm>
}

export async function unstake(shares: string): Promise<Farm> {
  if (env.useMocks) {
    await delay(400)
    const s = Number(shares)
    if (s <= 0) insufficient('Enter an amount of LP to unstake')
    if (s > mockFarm.staked) insufficient('Insufficient staked LP')
    mockFarm.staked -= s
    mockLpState.shares += s
    return readMockFarm()
  }
  return apiClient.post('/lp/farm/unstake', { shares }) as unknown as Promise<Farm>
}

export async function claim(): Promise<ClaimResult> {
  if (env.useMocks) {
    await delay(400)
    const claimed = mockFarm.earned
    if (claimed <= 0) insufficient('Nothing to claim')
    mockFarm.earned = 0
    mockBalances.fans += claimed
    return { claimed: claimed.toFixed(8), fansBalance: mockBalances.fans.toFixed(8) }
  }
  return apiClient.post('/lp/farm/claim') as unknown as Promise<ClaimResult>
}

/** $FANS price in USD (mock-derived from the pool ratio; UI display only). */
export function currentFansPriceUsd(): number {
  return env.useMocks ? fansPriceUsd() : 0.03
}

/** The signed-in user's simulated wallet balances (mock display only). */
export function mockWalletBalances() {
  return { eth: mockBalances.eth, fans: mockBalances.fans }
}
