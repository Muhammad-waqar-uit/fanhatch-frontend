'use client'

/**
 * Web3Provider — mounts the wagmi tree so ConnectKit + on-chain hooks work.
 *
 * This is the OUTER piece of the provider stack (WagmiProvider). The single
 * QueryClientProvider and ConnectKitProvider are mounted just inside it in
 * `app/providers.tsx` (Wagmi must sit outside the QueryClient).
 *
 * Wallet lifecycle is entirely user-driven now (MetaMask via ConnectKit) — there is
 * no background/auto-connect. `useWeb3Context()` / `useWallet()` reflect wagmi's
 * `useAccount`. When `web3Config.enabled` is false, consumers see a `'disabled'`
 * state and degrade to pure web2.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import type { Address } from 'viem'
import { WagmiProvider, useAccount } from 'wagmi'
import { updateWalletAddress, useAuthStore } from '@/features/auth'
import { wagmiConfig, web3Config } from './config'

export type Web3Status = 'disabled' | 'disconnected' | 'connecting' | 'reconnecting' | 'connected'

export interface Web3ContextValue {
  address: Address | null
  status: Web3Status
  isConnected: boolean
}

/**
 * Best-effort wallet linking: once a wallet is connected and the user is authenticated,
 * persist the address via `PATCH /users/me/wallet` (address-only — the backend accepts it
 * without a signature). Non-fatal and idempotent per address; no signature popup.
 */
function WalletLinker() {
  const { address, isConnected } = useAccount()
  const token = useAuthStore((s) => s.token)
  const persisted = useAuthStore((s) => s.user?.walletAddress ?? null)
  const setUser = useAuthStore((s) => s.setUser)
  const lastLinked = useRef<string | null>(null)

  useEffect(() => {
    if (!web3Config.enabled || !isConnected || !address || !token) return
    const lower = address.toLowerCase()
    if (persisted?.toLowerCase() === lower || lastLinked.current === lower) return
    lastLinked.current = lower
    void (async () => {
      try {
        await updateWalletAddress(address)
        setUser({ walletAddress: lower })
      } catch {
        // Non-fatal — the live address still drives the UI this session.
      }
    })()
  }, [address, isConnected, token, persisted, setUser])

  return null
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <WalletLinker />
      {children}
    </WagmiProvider>
  )
}

/** Wallet state from wagmi `useAccount`. Returns a disabled-mode shape when web3 is off. */
export function useWeb3Context(): Web3ContextValue {
  const { address, isConnected, status } = useAccount()
  if (!web3Config.enabled) {
    return { address: null, isConnected: false, status: 'disabled' }
  }
  return {
    address: (address as Address | undefined) ?? null,
    isConnected,
    status: status as Web3Status,
  }
}

/** Alias — same shape as `useWeb3Context`. */
export const useWallet = useWeb3Context
