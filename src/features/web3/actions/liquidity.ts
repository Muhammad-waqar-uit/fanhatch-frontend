'use client'

/**
 * FansSwap liquidity (verified in FansSwap.sol).
 * - addLiquidity(fansIn, minShares): payable (`value = ethIn`) AND pulls $FANS — approve $FANS first.
 * - removeLiquidity(shares, minEth, minFans): burns the caller's own LP tokens — no approve.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Hex } from 'viem'
import { fansSwapAbi } from '../abis'
import { web3Config } from '../config'
import { useSmartAccount } from '../use-smart-account'
import { approveTx } from './shared'

export interface AddLiquidityParams {
  /** $FANS to deposit. */
  fansIn: bigint
  /** ETH to deposit (wei), sent as msg.value. */
  ethIn: bigint
  /** Minimum LP shares to accept. */
  minShares?: bigint
}

export interface RemoveLiquidityParams {
  shares: bigint
  minEth?: bigint
  minFans?: bigint
}

export function useAddLiquidity() {
  const { sendTxBatch } = useSmartAccount()

  return useMutation<Hex, Error, AddLiquidityParams>({
    mutationFn: async ({ fansIn, ethIn, minShares }) => {
      const swap = web3Config.addresses.fansSwap
      const data = encodeFunctionData({
        abi: fansSwapAbi,
        functionName: 'addLiquidity',
        args: [fansIn, minShares ?? 0n],
      }) as Hex
      return sendTxBatch([
        approveTx(web3Config.addresses.fans, swap, fansIn),
        { to: swap, data, value: ethIn },
      ])
    },
  })
}

export function useRemoveLiquidity() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, RemoveLiquidityParams>({
    mutationFn: async ({ shares, minEth, minFans }) => {
      const data = encodeFunctionData({
        abi: fansSwapAbi,
        functionName: 'removeLiquidity',
        args: [shares, minEth ?? 0n, minFans ?? 0n],
      }) as Hex
      return sendTx(web3Config.addresses.fansSwap, data)
    },
  })
}
