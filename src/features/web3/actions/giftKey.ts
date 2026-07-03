'use client'

/**
 * Gift club keys — free transfer of internal ClubKey balances (ClubKey.sol:gift).
 * No payment, no approve; a single `gift(to, amount)` call.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import { clubKeyAbi } from '../abis'
import { useSmartAccount } from '../use-smart-account'
import { resolveClubKeyAddress } from './shared'

export interface GiftKeyParams {
  clubKey?: Address
  clubId?: bigint | number
  to: Address
  amount: bigint
}

export function useGiftKeyOnchain() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, GiftKeyParams>({
    mutationFn: async (params) => {
      const keyAddress = await resolveClubKeyAddress(params)
      const data = encodeFunctionData({
        abi: clubKeyAbi,
        functionName: 'gift',
        args: [params.to, params.amount],
      }) as Hex
      return sendTx(keyAddress, data)
    },
  })
}
