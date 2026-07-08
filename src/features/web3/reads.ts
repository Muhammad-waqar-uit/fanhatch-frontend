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
  fansLpVaultAbi,
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

/** The v4 pool's current reserves (ETH, $FANS) — the vault's single full-range position. */
export async function poolReserves(): Promise<{ eth: bigint; fans: bigint }> {
  if (!canRead()) return { eth: 0n, fans: 0n }
  try {
    const [eth, fans] = (await publicClient.readContract({
      address: web3Config.addresses.fansLpVault,
      abi: fansLpVaultAbi,
      functionName: 'getReserves',
    })) as [bigint, bigint]
    return { eth, fans }
  } catch {
    return { eth: 0n, fans: 0n }
  }
}

/** Current network gas price (wei); 0n on failure. Used to estimate the swap network fee. */
export async function currentGasPrice(): Promise<bigint> {
  if (!canRead()) return 0n
  try {
    return await publicClient.getGasPrice()
  } catch {
    return 0n
  }
}

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
 * FansHook per-swap fee (bps), always taken in $FANS (currency1). Default 150 = 1.5%.
 * Mirrors `FansHook.feeBps`; the v4 pool's own `fee` is 0.
 */
const HOOK_FEE_BPS = 150n

/**
 * Constant-product (x·y=k) swap quote computed locally from the v4 pool's reserves,
 * which — for the vault's single full-range position — are exposed by
 * `FansLPVault.getReserves()`. The pool has a 0 LP fee; the FansHook's 1.5% fee is
 * always denominated in $FANS, so we apply it to the $FANS leg of the trade.
 * Returns the expected output amount for `amountIn` (in the input token's wei).
 */
export async function swapQuote(direction: SwapDirection, amountIn: bigint): Promise<Amount> {
  if (!canRead() || amountIn <= 0n || !isAddress(web3Config.addresses.fansLpVault)) return ZERO
  try {
    const [reserveEth, reserveFans] = (await publicClient.readContract({
      address: web3Config.addresses.fansLpVault,
      abi: fansLpVaultAbi,
      functionName: 'getReserves',
    })) as readonly [bigint, bigint]
    if (reserveEth <= 0n || reserveFans <= 0n) return ZERO

    if (direction === 'ethToFans') {
      // Exact-in ETH → FANS: constant-product out, then take the fee from the $FANS output.
      const grossOut = (amountIn * reserveFans) / (reserveEth + amountIn)
      const raw = (grossOut * (10_000n - HOOK_FEE_BPS)) / 10_000n
      return amount(raw)
    }
    // Exact-in FANS → ETH: fee taken from the $FANS input, remainder swapped for ETH.
    const netIn = (amountIn * (10_000n - HOOK_FEE_BPS)) / 10_000n
    const raw = (netIn * reserveEth) / (reserveFans + netIn)
    return amount(raw)
  } catch {
    return ZERO
  }
}

/**
 * A user's FANS-LP position in the vault: their share balance, the vault's total supply,
 * and the ETH/$FANS the shares are currently redeemable for (pro-rata of `getReserves()`).
 */
export async function lpPosition(user: string): Promise<{
  shares: Amount
  totalShares: Amount
  ethReserve: Amount
  fansReserve: Amount
  ethShare: Amount
  fansShare: Amount
}> {
  const zero = {
    shares: ZERO,
    totalShares: ZERO,
    ethReserve: ZERO,
    fansReserve: ZERO,
    ethShare: ZERO,
    fansShare: ZERO,
  }
  if (!canRead() || !isAddress(user) || !isAddress(web3Config.addresses.fansLpVault)) return zero
  try {
    const vault = web3Config.addresses.fansLpVault
    const [shares, totalShares, reserves] = await Promise.all([
      publicClient.readContract({ address: vault, abi: fansLpVaultAbi, functionName: 'balanceOf', args: [user as Address] }),
      publicClient.readContract({ address: vault, abi: fansLpVaultAbi, functionName: 'totalSupply' }),
      publicClient.readContract({ address: vault, abi: fansLpVaultAbi, functionName: 'getReserves' }),
    ])
    const [ethReserve, fansReserve] = reserves as readonly [bigint, bigint]
    const total = totalShares as bigint
    const bal = shares as bigint
    const ethShare = total > 0n ? (ethReserve * bal) / total : 0n
    const fansShare = total > 0n ? (fansReserve * bal) / total : 0n
    return {
      shares: amount(bal),
      totalShares: amount(total),
      ethReserve: { raw: ethReserve, formatted: formatEther(ethReserve) },
      fansReserve: amount(fansReserve),
      ethShare: { raw: ethShare, formatted: formatEther(ethShare) },
      fansShare: amount(fansShare),
    }
  } catch {
    return zero
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
