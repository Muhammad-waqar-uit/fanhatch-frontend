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
import { ensureAllowance } from './shared'

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
  const { address, sendTx } = useSmartAccount()

  return useMutation<Hex, Error, AddLiquidityParams>({
    mutationFn: async ({ fansIn, ethIn, minShares }) => {
      if (!address) throw new Error('Connect your wallet to add liquidity.')
      const swap = web3Config.addresses.fansSwap
      // addLiquidity pulls $FANS via transferFrom — approve (if needed) first.
      await ensureAllowance({
        token: web3Config.addresses.fans,
        owner: address,
        spender: swap,
        amount: fansIn,
        sendTx,
      })
      const data = encodeFunctionData({
        abi: fansSwapAbi,
        functionName: 'addLiquidity',
        args: [fansIn, minShares ?? 0n],
      }) as Hex
      return sendTx(swap, data, ethIn)
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
