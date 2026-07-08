'use client'

/**
 * FansLPVault liquidity — Uniswap v4 hybrid ERC-20 vault (verified in FansLPVault.sol).
 * - deposit(fansIn): payable (`value = ethIn`) AND pulls $FANS — approve $FANS → vault first.
 *   Mints FANS-LP vault shares to the caller.
 * - withdraw(shares): burns the caller's own FANS-LP shares → ETH + $FANS. No approve.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Hex } from 'viem'
import { fansLpVaultAbi } from '../abis'
import { web3Config } from '../config'
import { useSmartAccount } from '../use-smart-account'
import { ensureAllowance } from './shared'

export interface AddLiquidityParams {
  /** $FANS to deposit. */
  fansIn: bigint
  /** ETH to deposit (wei), sent as msg.value. */
  ethIn: bigint
  /** Minimum LP shares to accept. (Vault.deposit has no min-shares arg; kept for API stability.) */
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
    mutationFn: async ({ fansIn, ethIn }) => {
      if (!address) throw new Error('Connect your wallet to add liquidity.')
      const vault = web3Config.addresses.fansLpVault
      // deposit pulls $FANS via transferFrom — approve (if needed) the vault first.
      await ensureAllowance({
        token: web3Config.addresses.fans,
        owner: address,
        spender: vault,
        amount: fansIn,
        sendTx,
      })
      const data = encodeFunctionData({
        abi: fansLpVaultAbi,
        functionName: 'deposit',
        args: [fansIn],
      }) as Hex
      return sendTx(vault, data, ethIn)
    },
  })
}

export function useRemoveLiquidity() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, RemoveLiquidityParams>({
    mutationFn: async ({ shares }) => {
      const data = encodeFunctionData({
        abi: fansLpVaultAbi,
        functionName: 'withdraw',
        args: [shares],
      }) as Hex
      return sendTx(web3Config.addresses.fansLpVault, data)
    },
  })
}
