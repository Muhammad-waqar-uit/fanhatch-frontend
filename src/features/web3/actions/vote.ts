'use client'

/**
 * Vote for a club president (GovernanceModule.voteForPresident). No payment/approve;
 * voting weight is read on-chain from the caller's key balance. Single call.
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import { governanceModuleAbi } from '../abis'
import { web3Config } from '../config'
import { useSmartAccount } from '../use-smart-account'

export interface VoteParams {
  clubId: bigint | number
  candidate: Address
}

export function useVoteOnchain() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, VoteParams>({
    mutationFn: async ({ clubId, candidate }) => {
      const data = encodeFunctionData({
        abi: governanceModuleAbi,
        functionName: 'voteForPresident',
        args: [BigInt(clubId), candidate],
      }) as Hex
      return sendTx(web3Config.addresses.governance, data)
    },
  })
}
