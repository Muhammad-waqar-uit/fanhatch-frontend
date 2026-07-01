'use client'

/**
 * React Query wrappers for the LP feature. Reads (pool/position/farm) are
 * cached; every mutation invalidates the trio since the AMM state is shared.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function usePool() {
  return useQuery({ queryKey: poolKey, queryFn: getPool })
}

export function usePosition() {
  return useQuery({ queryKey: positionKey, queryFn: getPosition })
}

export function useFarm() {
  return useQuery({ queryKey: farmKey, queryFn: getFarm })
}

/** Invalidate pool + position + farm after a state-changing action. */
function useInvalidateLp() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: poolKey })
    qc.invalidateQueries({ queryKey: positionKey })
    qc.invalidateQueries({ queryKey: farmKey })
  }
}

export function useSwap() {
  const invalidate = useInvalidateLp()
  return useMutation({
    mutationFn: (vars: { direction: SwapDirection; amountIn: string; minOut?: string }) =>
      swap(vars.direction, vars.amountIn, vars.minOut),
    onSuccess: invalidate,
  })
}

export function useAddLiquidity() {
  const invalidate = useInvalidateLp()
  return useMutation({
    mutationFn: (vars: { ethIn: string; fansIn: string }) => addLiquidity(vars.ethIn, vars.fansIn),
    onSuccess: invalidate,
  })
}

export function useRemoveLiquidity() {
  const invalidate = useInvalidateLp()
  return useMutation({
    mutationFn: (shares: string) => removeLiquidity(shares),
    onSuccess: invalidate,
  })
}

export function useStake() {
  const invalidate = useInvalidateLp()
  return useMutation({
    mutationFn: (shares: string) => stake(shares),
    onSuccess: invalidate,
  })
}

export function useUnstake() {
  const invalidate = useInvalidateLp()
  return useMutation({
    mutationFn: (shares: string) => unstake(shares),
    onSuccess: invalidate,
  })
}

export function useClaim() {
  const invalidate = useInvalidateLp()
  return useMutation({
    mutationFn: () => claim(),
    onSuccess: invalidate,
  })
}
