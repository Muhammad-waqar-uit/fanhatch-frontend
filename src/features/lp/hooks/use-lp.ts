'use client'

/**
 * React Query wrappers for the LP feature. Reads (pool/position/farm) are
 * cached; every mutation invalidates the trio since the AMM state is shared.
 *
 * Each mutation branches on `web3Config.enabled && isConnected`:
 *   - connected  → run the on-chain tx via the connected wallet (v4 router / vault / StakingManager)
 *                  and, on success, refresh both the web2 caches and the web3 reads;
 *   - otherwise  → keep the existing web2 API call (mock or backend) exactly as-is.
 * Amounts arrive as decimal strings; on-chain paths convert to 18-decimal wei.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parseEther } from 'viem'
import {
  useWeb3Context,
  web3Config,
  useSwap as useOnchainSwap,
  useAddLiquidity as useOnchainAddLiquidity,
  useRemoveLiquidity as useOnchainRemoveLiquidity,
  useStake as useOnchainStake,
  useUnstake as useOnchainUnstake,
  useClaim as useOnchainClaim,
} from '@/features/web3'
import {
  addLiquidity,
  claim,
  getFarm,
  getPool,
  getPosition,
  removeLiquidity,
  stake,
  swap,
  unstake,
} from '../api/lp.api'
import type { SwapDirection } from '../types'

const poolKey = ['lp', 'pool']
const positionKey = ['lp', 'position']
const farmKey = ['lp', 'farm']

/** $FANS, ETH and LP shares are all 18-decimal — parse a decimal string to wei, 0n on garbage. */
function toWei(value: string): bigint {
  const v = value.trim()
  if (!v || Number(v) <= 0) return 0n
  try {
    return parseEther(v)
  } catch {
    return 0n
  }
}

/** True only when on-chain writes should replace the web2 path. */
function useOnchainEnabled(): boolean {
  const { isConnected } = useWeb3Context()
  return web3Config.enabled && isConnected
}

export function usePool() {
  return useQuery({ queryKey: poolKey, queryFn: getPool })
}

export function usePosition() {
  return useQuery({ queryKey: positionKey, queryFn: getPosition })
}

export function useFarm() {
  return useQuery({ queryKey: farmKey, queryFn: getFarm })
}

/** Invalidate pool + position + farm (and the web3 reads) after a state-changing action. */
function useInvalidateLp() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: poolKey })
    qc.invalidateQueries({ queryKey: positionKey })
    qc.invalidateQueries({ queryKey: farmKey })
    // Refresh on-chain balances / quotes / stake info when they're driving the UI.
    qc.invalidateQueries({ queryKey: ['web3'] })
  }
}

export function useSwap() {
  const invalidate = useInvalidateLp()
  const onchain = useOnchainEnabled()
  const onchainSwap = useOnchainSwap()
  return useMutation({
    mutationFn: async (vars: { direction: SwapDirection; amountIn: string; minOut?: string }) => {
      if (onchain) {
        return onchainSwap.mutateAsync({
          direction: vars.direction === 'eth_to_fans' ? 'ethForFans' : 'fansForEth',
          amountIn: toWei(vars.amountIn),
          minOut: vars.minOut ? toWei(vars.minOut) : undefined,
          slippageBps: 100n,
        })
      }
      return swap(vars.direction, vars.amountIn, vars.minOut)
    },
    onSuccess: invalidate,
  })
}

export function useAddLiquidity() {
  const invalidate = useInvalidateLp()
  const onchain = useOnchainEnabled()
  const onchainAdd = useOnchainAddLiquidity()
  return useMutation({
    mutationFn: async (vars: { ethIn: string; fansIn: string }) => {
      if (onchain) {
        return onchainAdd.mutateAsync({ ethIn: toWei(vars.ethIn), fansIn: toWei(vars.fansIn) })
      }
      return addLiquidity(vars.ethIn, vars.fansIn)
    },
    onSuccess: invalidate,
  })
}

export function useRemoveLiquidity() {
  const invalidate = useInvalidateLp()
  const onchain = useOnchainEnabled()
  const onchainRemove = useOnchainRemoveLiquidity()
  return useMutation({
    mutationFn: async (shares: string) => {
      if (onchain) return onchainRemove.mutateAsync({ shares: toWei(shares) })
      return removeLiquidity(shares)
    },
    onSuccess: invalidate,
  })
}

export function useStake() {
  const invalidate = useInvalidateLp()
  const onchain = useOnchainEnabled()
  const onchainStake = useOnchainStake()
  return useMutation({
    mutationFn: async (shares: string) => {
      if (onchain) {
        // LP farm: stake the FANS-LP vault token into the `stakingLp` StakingManager.
        return onchainStake.mutateAsync({
          amount: toWei(shares),
          farm: web3Config.addresses.stakingLp,
          stakingToken: web3Config.addresses.fansLpVault,
        })
      }
      return stake(shares)
    },
    onSuccess: invalidate,
  })
}

export function useUnstake() {
  const invalidate = useInvalidateLp()
  const onchain = useOnchainEnabled()
  const onchainUnstake = useOnchainUnstake()
  return useMutation({
    mutationFn: async (shares: string) => {
      if (onchain) {
        return onchainUnstake.mutateAsync({
          amount: toWei(shares),
          farm: web3Config.addresses.stakingLp,
        })
      }
      return unstake(shares)
    },
    onSuccess: invalidate,
  })
}

export function useClaim() {
  const invalidate = useInvalidateLp()
  const onchain = useOnchainEnabled()
  const onchainClaim = useOnchainClaim()
  return useMutation({
    mutationFn: async () => {
      if (onchain) return onchainClaim.mutateAsync({ farm: web3Config.addresses.stakingLp })
      return claim()
    },
    onSuccess: invalidate,
  })
}
