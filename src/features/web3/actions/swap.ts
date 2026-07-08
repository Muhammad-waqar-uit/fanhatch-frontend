'use client'

/**
 * FansV4Router ETH ↔ $FANS swaps — Uniswap v4 hybrid (verified in FansV4Router.sol).
 * - ETH→FANS: `swapExactEthForFans(minOut)` is payable, `value = ethIn`. No approve.
 * - FANS→ETH: `swapExactFansForEth(amountIn, minOut)` pulls $FANS via transferFrom — approve
 *   the router first (spender = fansV4Router).
 *
 * `useSwap` is the direction-agnostic entry point; the two typed hooks wrap it.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Hex } from 'viem'
import { fansV4RouterAbi } from '../abis'
import { web3Config } from '../config'
import { useSmartAccount } from '../use-smart-account'
import { ensureAllowance, withSlippageDown } from './shared'

export type SwapDirection = 'ethForFans' | 'fansForEth'

export interface SwapParams {
  direction: SwapDirection
  /** Input amount (wei of ETH for ethForFans, $FANS units for fansForEth). */
  amountIn: bigint
  /** Minimum output. If omitted, derived from `quoteOut` + `slippageBps`. */
  minOut?: bigint
  /** Quoted output amount used to derive `minOut` when it's not passed. */
  quoteOut?: bigint
  slippageBps?: bigint
}

export function useSwap() {
  const { address, sendTx } = useSmartAccount()

  return useMutation<Hex, Error, SwapParams>({
    mutationFn: async ({ direction, amountIn, minOut, quoteOut, slippageBps }) => {
      const router = web3Config.addresses.fansV4Router
      const minOutFinal =
        minOut ?? (quoteOut !== undefined ? withSlippageDown(quoteOut, slippageBps) : 0n)

      if (direction === 'ethForFans') {
        const data = encodeFunctionData({
          abi: fansV4RouterAbi,
          functionName: 'swapExactEthForFans',
          args: [minOutFinal],
        }) as Hex
        return sendTx(router, data, amountIn)
      }

      // fansForEth pulls $FANS via transferFrom — approve (if needed) the router first.
      if (!address) throw new Error('Connect your wallet to swap.')
      await ensureAllowance({
        token: web3Config.addresses.fans,
        owner: address,
        spender: router,
        amount: amountIn,
        sendTx,
      })
      const data = encodeFunctionData({
        abi: fansV4RouterAbi,
        functionName: 'swapExactFansForEth',
        args: [amountIn, minOutFinal],
      }) as Hex
      return sendTx(router, data)
    },
  })
}

export function useSwapEthForFans() {
  const swap = useSwap()
  return {
    ...swap,
    mutate: (p: Omit<SwapParams, 'direction'>) => swap.mutate({ ...p, direction: 'ethForFans' }),
    mutateAsync: (p: Omit<SwapParams, 'direction'>) =>
      swap.mutateAsync({ ...p, direction: 'ethForFans' }),
  }
}

export function useSwapFansForEth() {
  const swap = useSwap()
  return {
    ...swap,
    mutate: (p: Omit<SwapParams, 'direction'>) => swap.mutate({ ...p, direction: 'fansForEth' }),
    mutateAsync: (p: Omit<SwapParams, 'direction'>) =>
      swap.mutateAsync({ ...p, direction: 'fansForEth' }),
  }
}
