'use client'

/**
 * Buy club keys. Payment model (verified in ClubKey.sol:buyKeys): pull-$FANS via
 * `safeTransferFrom` of `cost + fee` — NOT payable ETH. So we approve $FANS to the
 * ClubKey for `maxCost` first, then call `buyKeys(amount, maxCost)` in one batched userop.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import { clubKeyAbi } from '../abis'
import { web3Config } from '../config'
import { useSmartAccount } from '../use-smart-account'
import { approveTx, resolveClubKeyAddress, withSlippageUp } from './shared'

export interface BuyKeyParams {
  /** ClubKey contract address (skip `clubId` if provided). */
  clubKey?: Address
  /** Club id — used to resolve the ClubKey address from the factory when `clubKey` is absent. */
  clubId?: bigint | number
  /** Number of keys to buy. */
  amount: bigint
  /** Max $FANS to spend (cost+fee). If omitted, computed from `buyPrice` + `slippageBps`. */
  maxCost?: bigint
  /** Quoted buy price (cost+fee) used to derive `maxCost` when it's not passed. */
  buyPrice?: bigint
  slippageBps?: bigint
}

export function useBuyKey() {
  const { sendTxBatch } = useSmartAccount()

  return useMutation<Hex, Error, BuyKeyParams>({
    mutationFn: async (params) => {
      const keyAddress = await resolveClubKeyAddress(params)
      const maxCost =
        params.maxCost ??
        (params.buyPrice !== undefined
          ? withSlippageUp(params.buyPrice, params.slippageBps)
          : undefined)
      if (maxCost === undefined) throw new Error('buyKey: maxCost or buyPrice is required')

      const buyData = encodeFunctionData({
        abi: clubKeyAbi,
        functionName: 'buyKeys',
        args: [params.amount, maxCost],
      }) as Hex

      return sendTxBatch([
        approveTx(web3Config.addresses.fans, keyAddress, maxCost),
        { to: keyAddress, data: buyData },
      ])
    },
  })
}
