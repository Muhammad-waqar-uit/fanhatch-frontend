'use client'

/**
 * Sell club keys. Keys are internal ClubKey balances (no ERC20 approve needed) and the
 * seller is paid from the $FANS curve reserve — so this is a single `sellKeys` call.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import { clubKeyAbi } from '../abis'
import { useSmartAccount } from '../use-smart-account'
import { resolveClubKeyAddress, withSlippageDown } from './shared'

export interface SellKeyParams {
  clubKey?: Address
  clubId?: bigint | number
  amount: bigint
  /** Minimum $FANS proceeds. If omitted, derived from `sellPrice` + `slippageBps`. */
  minProceeds?: bigint
  sellPrice?: bigint
  slippageBps?: bigint
}

export function useSellKey() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, SellKeyParams>({
    mutationFn: async (params) => {
      const keyAddress = await resolveClubKeyAddress(params)
      const minProceeds =
        params.minProceeds ??
        (params.sellPrice !== undefined ? withSlippageDown(params.sellPrice, params.slippageBps) : 0n)

      const data = encodeFunctionData({
        abi: clubKeyAbi,
        functionName: 'sellKeys',
        args: [params.amount, minProceeds],
      }) as Hex

      return sendTx(keyAddress, data)
    },
  })
}
