'use client'

/**
 * Shared helpers for on-chain write actions: ERC20 approve encoding, slippage math,
 * and ClubKey address resolution from the factory.
 */

import { createPublicClient, encodeFunctionData, http, type Address, type Hex } from 'viem'
import { sepolia } from 'viem/chains'
import { web3Config } from '../config'
import { platformTokenAbi, clubFactoryAbi } from '../abis'

/** Minimal read client for action-side lookups (allowance, club-key resolution). */
let publicClient: ReturnType<typeof createPublicClient> | null = null
function getPublicClient() {
  if (!publicClient) {
    publicClient = createPublicClient({ chain: sepolia, transport: http(web3Config.rpcUrl || undefined) })
  }
  return publicClient
}

/** Apply an upward slippage tolerance (for max-cost / max-in bounds). bps e.g. 100 = 1%. */
export function withSlippageUp(amount: bigint, slippageBps = 100n): bigint {
  return (amount * (10_000n + slippageBps)) / 10_000n
}

/** Apply a downward slippage tolerance (for min-out / min-proceeds bounds). */
export function withSlippageDown(amount: bigint, slippageBps = 100n): bigint {
  return (amount * (10_000n - slippageBps)) / 10_000n
}

/** Signature of the wallet's single-tx sender (from `useSmartAccount().sendTx`). */
type SendTx = (to: Address, data?: Hex, value?: bigint) => Promise<Hex>

/**
 * Ensure `owner` has approved at least `amount` of `token` to `spender`. Reads the current
 * allowance (viem) and, only if insufficient, sends an `approve(spender, amount)` tx and waits
 * for its receipt (via `sendTx`). No-op when the allowance already covers `amount`.
 */
export async function ensureAllowance(params: {
  token: Address
  owner: Address
  spender: Address
  amount: bigint
  sendTx: SendTx
}): Promise<void> {
  const { token, owner, spender, amount, sendTx } = params
  if (amount <= 0n) return

  const allowance = (await getPublicClient().readContract({
    address: token,
    abi: platformTokenAbi,
    functionName: 'allowance',
    args: [owner, spender],
  })) as bigint
  if (allowance >= amount) return

  const data = encodeFunctionData({
    abi: platformTokenAbi,
    functionName: 'approve',
    args: [spender, amount],
  }) as Hex
  await sendTx(token, data)
}

/**
 * Resolve a club's ClubKey contract address. Pass the address directly if you already
 * have it; otherwise supply `clubId` and it's read from `clubFactory.clubKeyOf(clubId)`.
 */
export async function resolveClubKeyAddress(params: {
  clubKey?: Address
  clubId?: bigint | number
}): Promise<Address> {
  if (params.clubKey) return params.clubKey
  if (params.clubId === undefined) throw new Error('resolveClubKeyAddress: clubKey or clubId required')
  const addr = (await getPublicClient().readContract({
    address: web3Config.addresses.clubFactory,
    abi: clubFactoryAbi,
    functionName: 'clubKeyOf',
    args: [BigInt(params.clubId)],
  })) as Address
  if (!addr || addr === '0x0000000000000000000000000000000000000000') {
    throw new Error(`No ClubKey found for club ${params.clubId}`)
  }
  return addr
}
