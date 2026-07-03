'use client'

/**
 * useSmartAccount() — the interface every write action (and Agent B's reads) assume.
 *
 * Returns `{ address, isConnected, login, logout, sendTx, sendTxBatch }`.
 * - `sendTx(to, data, value?)` builds + sends a single sponsored userop and waits for the receipt.
 * - `sendTxBatch(txs)` does the same for a batch (e.g. ERC20 approve + action) atomically.
 */

import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { sendUserOp, type Web3Transaction } from './client'
import { useWeb3Context } from './provider'

export interface UseSmartAccount {
  address: Address | null
  isConnected: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  /** Send a single userop (to, calldata, optional ETH value) and wait for the receipt. */
  sendTx: (to: Address, data?: Hex, value?: bigint) => Promise<Hex>
  /** Send a batch of calls as one atomic userop (e.g. approve + action). */
  sendTxBatch: (txs: Web3Transaction[]) => Promise<Hex>
}

export function useSmartAccount(): UseSmartAccount {
  const { address, isConnected, login, logout } = useWeb3Context()

  const sendTx = useCallback(
    (to: Address, data?: Hex, value?: bigint) => sendUserOp({ to, data, value }),
    [],
  )

  const sendTxBatch = useCallback((txs: Web3Transaction[]) => sendUserOp(txs), [])

  return { address, isConnected, login, logout, sendTx, sendTxBatch }
}
