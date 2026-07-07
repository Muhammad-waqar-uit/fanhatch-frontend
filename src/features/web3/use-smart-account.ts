'use client'

/**
 * useSmartAccount() — the wallet interface every write action assumes.
 *
 * Plain EOA (MetaMask via wagmi) — no smart account, no gasless. Returns
 * `{ address, isConnected, sendTx }` where `sendTx(to, data, value?)` sends one
 * transaction and waits for its receipt, returning the on-chain tx hash.
 */

import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useAccount } from 'wagmi'
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions'
import { wagmiConfig } from './config'

export interface UseSmartAccount {
  address: Address | null
  isConnected: boolean
  /** Send a single tx (to, calldata, optional ETH value) and wait for the receipt. */
  sendTx: (to: Address, data?: Hex, value?: bigint) => Promise<Hex>
}

export function useSmartAccount(): UseSmartAccount {
  const { address, isConnected } = useAccount()

  const sendTx = useCallback(async (to: Address, data?: Hex, value?: bigint): Promise<Hex> => {
    const hash = await sendTransaction(wagmiConfig, { to, data, value })
    await waitForTransactionReceipt(wagmiConfig, { hash })
    return hash
  }, [])

  return { address: (address as Address | undefined) ?? null, isConnected, sendTx }
}

/** Alias kept for callers that prefer the `useWallet` name. */
export const useWalletAccount = useSmartAccount
