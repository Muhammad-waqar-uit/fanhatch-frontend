'use client'

/**
 * StakingManager farm actions (verified in StakingManager.sol — Synthetix StakingRewards).
 * - stake(amount): pulls the staking token via transferFrom — approve first.
 * - withdraw(amount): returns staked principal — no approve.
 * - getReward(): claims accrued $FANS rewards — no approve.
 *
 * There is one StakingManager per stake token. Defaults target the $FANS farm
 * (`stakingFans`, staking token = $FANS); pass `farm` + `stakingToken` for the LP farm
 * (`stakingLp`, staking token = the FansSwap LP token, i.e. the FansSwap contract itself).
 */

import { useMutation } from '@tanstack/react-query'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import { stakingManagerAbi } from '../abis'
import { web3Config } from '../config'
import { useSmartAccount } from '../use-smart-account'
import { approveTx } from './shared'

export interface StakeParams {
  amount: bigint
  /** Farm (StakingManager) address. Defaults to the $FANS farm. */
  farm?: Address
  /** Staking token to approve. Defaults to $FANS (matches the default farm). */
  stakingToken?: Address
}

export interface UnstakeParams {
  amount: bigint
  farm?: Address
}

export interface ClaimParams {
  farm?: Address
}

export function useStake() {
  const { sendTxBatch } = useSmartAccount()

  return useMutation<Hex, Error, StakeParams>({
    mutationFn: async ({ amount, farm, stakingToken }) => {
      const farmAddress = farm ?? web3Config.addresses.stakingFans
      const token = stakingToken ?? web3Config.addresses.fans
      const data = encodeFunctionData({
        abi: stakingManagerAbi,
        functionName: 'stake',
        args: [amount],
      }) as Hex
      return sendTxBatch([approveTx(token, farmAddress, amount), { to: farmAddress, data }])
    },
  })
}

export function useUnstake() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, UnstakeParams>({
    mutationFn: async ({ amount, farm }) => {
      const farmAddress = farm ?? web3Config.addresses.stakingFans
      const data = encodeFunctionData({
        abi: stakingManagerAbi,
        functionName: 'withdraw',
        args: [amount],
      }) as Hex
      return sendTx(farmAddress, data)
    },
  })
}

export function useClaim() {
  const { sendTx } = useSmartAccount()

  return useMutation<Hex, Error, ClaimParams>({
    mutationFn: async ({ farm } = {}) => {
      const farmAddress = farm ?? web3Config.addresses.stakingFans
      const data = encodeFunctionData({
        abi: stakingManagerAbi,
        functionName: 'getReward',
        args: [],
      }) as Hex
      return sendTx(farmAddress, data)
    },
  })
}
