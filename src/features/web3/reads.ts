/**
 * On-chain READ layer — pure viem reads, no smart account, no writes.
 *
 * A single `publicClient` (http → sepolia) plus thin async helpers that map raw
 * bigint results into `{ raw, formatted }` with safe zero-defaults when web3 is
 * disabled, an address is missing, or a call reverts. Consumed by `hooks/`.
 */
import {
  createPublicClient,
  http,
  formatEther,
  formatUnits,
  type Address,
} from 'viem'
import { sepolia } from 'viem/chains'
import { web3Config } from './config'
import {
  platformTokenAbi,
  clubFactoryAbi,
  clubKeyAbi,
  fansSwapAbi,
  governanceModuleAbi,
  stakingManagerAbi,
} from './abis'

/** $FANS + keys + LP all use 18 decimals (mirrors the ERC-20s on-chain). */
const FANS_DECIMALS = 18

/** Shared viem read client. Never triggers a wallet — pure RPC. */
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(web3Config.rpcUrl || undefined),
})

/** Money-like return: raw wei bigint + a human-readable string. */
export type Amount = { raw: bigint; formatted: string }

const ZERO: Amount = { raw: 0n, formatted: '0' }

const amount = (raw: bigint, decimals = FANS_DECIMALS): Amount => ({
  raw,
  formatted: formatUnits(raw, decimals),
})

/** True only when reads should hit the chain (config on + rpc present). */
const canRead = (): boolean => web3Config.enabled && Boolean(web3Config.rpcUrl)

const isAddress = (a?: string): a is Address =>
  typeof a === 'string' && /^0x[0-9a-fA-F]{40}$/.test(a)

/** Which staking farm to read — maps to the deployed StakingManager address. */
export type StakingFarm = 'fans' | 'lp'

/** Swap direction for AMM quotes. */
export type SwapDirection = 'ethToFans' | 'fansToEth'

const stakingAddress = (farm: StakingFarm): string =>
  farm === 'lp' ? web3Config.addresses.stakingLp : web3Config.addresses.stakingFans

/** Resolve a club's ClubKey contract address from the factory (`clubKeyOf`). */
export async function resolveClubKey(clubId: bigint): Promise<Address | null> {
  if (!canRead() || !isAddress(web3Config.addresses.clubFactory)) return null
  try {
    const addr = await publicClient.readContract({
      address: web3Config.addresses.clubFactory,
      abi: clubFactoryAbi,
      functionName: 'clubKeyOf',
      args: [clubId],
    })
    return isAddress(addr) ? addr : null
  } catch {
    return null
  }
}

/** Cost (in $FANS) to buy `amount` keys of `clubKey`. */
export async function keyBuyPrice(clubKey: string, keyAmount: bigint): Promise<Amount> {
  if (!canRead() || !isAddress(clubKey)) return ZERO
  try {
    const raw = await publicClient.readContract({
      address: clubKey,
      abi: clubKeyAbi,
      functionName: 'buyPrice',
      args: [keyAmount],
    })
    return amount(raw)
  } catch {
    return ZERO
  }
}

/** Proceeds (in $FANS) from selling `amount` keys of `clubKey`. */
export async function keySellPrice(clubKey: string, keyAmount: bigint): Promise<Amount> {
  if (!canRead() || !isAddress(clubKey)) return ZERO
  try {
    const raw = await publicClient.readContract({
      address: clubKey,
      abi: clubKeyAbi,
      functionName: 'sellPrice',
      args: [keyAmount],
    })
    return amount(raw)
  } catch {
    return ZERO
  }
}

/** How many keys of `clubKey` a `user` holds. */
export async function keyBalance(clubKey: string, user: string): Promise<Amount> {
  if (!canRead() || !isAddress(clubKey) || !isAddress(user)) return ZERO
  try {
    const raw = await publicClient.readContract({
      address: clubKey,
      abi: clubKeyAbi,
      functionName: 'balanceOf',
      args: [user],
    })
    return amount(raw)
  } catch {
    return ZERO
  }
}

/** $FANS ERC-20 balance of `user`. */
export async function fansBalance(user: string): Promise<Amount> {
  if (!canRead() || !isAddress(user) || !isAddress(web3Config.addresses.fans)) return ZERO
  try {
    const raw = await publicClient.readContract({
      address: web3Config.addresses.fans,
      abi: platformTokenAbi,
      functionName: 'balanceOf',
      args: [user],
    })
    return amount(raw)
  } catch {
    return ZERO
  }
}

/** Native ETH balance of `user`. */
export async function ethBalance(user: string): Promise<Amount> {
  if (!canRead() || !isAddress(user)) return ZERO
  try {
    const raw = await publicClient.getBalance({ address: user })
    return { raw, formatted: formatEther(raw) }
  } catch {
    return ZERO
  }
}

/**
 * Constant-product (x·y=k) swap quote computed locally from on-chain reserves,
 * applying the same 0.3% fee as `FansSwap._amountOut` (FEE_BPS = 30 / 10_000).
 * Returns the expected output amount for `amountIn` (in the input token's wei).
 */
export async function swapQuote(direction: SwapDirection, amountIn: bigint): Promise<Amount> {
  if (!canRead() || amountIn <= 0n || !isAddress(web3Config.addresses.fansSwap)) return ZERO
  try {
    const [reserveEth, reserveFans] = await Promise.all([
      publicClient.readContract({
        address: web3Config.addresses.fansSwap,
        abi: fansSwapAbi,
        functionName: 'reserveEth',
      }),
      publicClient.readContract({
        address: web3Config.addresses.fansSwap,
        abi: fansSwapAbi,
        functionName: 'reserveFans',
      }),
    ])
    if (reserveEth <= 0n || reserveFans <= 0n) return ZERO

    const [reserveIn, reserveOut] =
      direction === 'ethToFans' ? [reserveEth, reserveFans] : [reserveFans, reserveEth]

    // amountInWithFee = amountIn * (10000 - 30); out = (amountInWithFee * reserveOut) / (reserveIn * 10000 + amountInWithFee)
    const amountInWithFee = amountIn * 9970n
    const raw = (amountInWithFee * reserveOut) / (reserveIn * 10_000n + amountInWithFee)
    // Output token decimals match input for both ETH (18) and $FANS (18).
    return amount(raw)
  } catch {
    return ZERO
  }
}

/** Staked balance + claimable rewards for `user` on a given farm. */
export async function stakeInfo(
  farm: StakingFarm,
  user: string,
): Promise<{ staked: Amount; earned: Amount }> {
  const addr = stakingAddress(farm)
  if (!canRead() || !isAddress(addr) || !isAddress(user)) {
    return { staked: ZERO, earned: ZERO }
  }
  try {
    const [staked, earned] = await Promise.all([
      publicClient.readContract({
        address: addr,
        abi: stakingManagerAbi,
        functionName: 'balanceOf',
        args: [user],
      }),
      publicClient.readContract({
        address: addr,
        abi: stakingManagerAbi,
        functionName: 'earned',
        args: [user],
      }),
    ])
    return { staked: amount(staked), earned: amount(earned) }
  } catch {
    return { staked: ZERO, earned: ZERO }
  }
}

/** Total votes cast for `candidate` in `clubId`'s presidential race. */
export async function presidentVotes(clubId: bigint, candidate: string): Promise<Amount> {
  if (!canRead() || !isAddress(candidate) || !isAddress(web3Config.addresses.governance)) {
    return ZERO
  }
  try {
    const raw = await publicClient.readContract({
      address: web3Config.addresses.governance,
      abi: governanceModuleAbi,
      functionName: 'votesFor',
      args: [clubId, candidate],
    })
    return amount(raw)
  } catch {
    return ZERO
  }
}
