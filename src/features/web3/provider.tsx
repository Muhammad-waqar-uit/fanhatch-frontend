'use client'

/**
 * Web3Provider — React context exposing the Biconomy smart account, driven by **auth state**.
 *
 * Background flow (mvmnt parity): when the user is authenticated, the provider silently runs
 * Web3Auth SFA `connect()` with the backend-minted id-token (`web3authToken` from the login
 * response, or re-minted via `GET /auth/web3auth/token` on reload) → derives the smart-account
 * address → persists it via `PATCH /users/me/wallet`. **No user action, no connect button.**
 *
 * EXPORTED but NOT mounted here (the orchestrator mounts it in app/providers.tsx).
 * When `web3Config.enabled` is false the provider still renders but stays `'disabled'`, so
 * consumers degrade gracefully to pure web2. On logout the session is cleared.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Address } from 'viem'
import { getWeb3AuthToken, updateWalletAddress, useAuthStore } from '@/features/auth'
import { web3Config } from './config'
import {
  connectWithToken,
  isWeb3Available,
  logout as clientLogout,
  restoreSession,
} from './client'

export type Web3Status = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error'

export interface Web3ContextValue {
  address: Address | null
  status: Web3Status
  isConnected: boolean
  error: string | null
  /** Manual reconnect affordance (e.g. after a failed background init). */
  login: () => Promise<void>
  logout: () => Promise<void>
}

const Web3Context = createContext<Web3ContextValue | null>(null)

export function Web3Provider({ children }: { children: ReactNode }) {
  const enabled = web3Config.enabled

  // Auth state drives the wallet lifecycle.
  const token = useAuthStore((s) => s.token)
  const web3authToken = useAuthStore((s) => s.web3authToken)
  const persistedWallet = useAuthStore((s) => s.user?.walletAddress ?? null)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = Boolean(token)

  const [address, setAddress] = useState<Address | null>(null)
  const [status, setStatus] = useState<Web3Status>(enabled ? 'disconnected' : 'disabled')
  const [error, setError] = useState<string | null>(null)

  // Guards a single in-flight background attempt (mount + re-render bursts).
  const attemptingRef = useRef(false)

  // Persist the derived address once, only when it differs from what's stored.
  const persistWallet = useCallback(
    async (addr: Address) => {
      if (persistedWallet && persistedWallet.toLowerCase() === addr.toLowerCase()) return
      try {
        await updateWalletAddress(addr)
        setUser({ walletAddress: addr.toLowerCase() })
      } catch {
        // Non-fatal — the live address still drives the UI this session.
      }
    },
    [persistedWallet, setUser],
  )

  /**
   * Silent background connect: restore a persisted SFA session if present, else mint/read an
   * id-token and run SFA connect. Safe to call repeatedly — single-flight via attemptingRef.
   */
  const backgroundConnect = useCallback(async () => {
    if (!enabled || !isWeb3Available() || attemptingRef.current) return
    if (!isAuthenticated) return
    attemptingRef.current = true
    setStatus('connecting')
    setError(null)
    try {
      // Fast path: SFA session persisted across reload — no id-token needed.
      const restored = await restoreSession()
      if (restored) {
        setAddress(restored.address)
        setStatus('connected')
        void persistWallet(restored.address)
        return
      }

      // Otherwise obtain a fresh id-token: from the login response, else re-mint.
      const idToken = web3authToken ?? (await getWeb3AuthToken())
      if (!idToken) {
        // No id-token available (mock/web2 session) — stay disconnected silently.
        setStatus('disconnected')
        return
      }

      const { address: addr } = await connectWithToken(idToken)
      setAddress(addr)
      setStatus('connected')
      void persistWallet(addr)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wallet connection failed')
      setStatus('error')
    } finally {
      attemptingRef.current = false
    }
  }, [enabled, isAuthenticated, web3authToken, persistWallet])

  // Auto-connect when authenticated; tear down when the session ends.
  useEffect(() => {
    if (!enabled) return
    if (isAuthenticated) {
      if (status === 'disconnected' || status === 'error') void backgroundConnect()
      return
    }
    // Logged out — clear any wallet session.
    if (address || status === 'connected' || status === 'connecting') {
      void clientLogout()
      setAddress(null)
      setError(null)
      setStatus('disconnected')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isAuthenticated, web3authToken])

  const login = useCallback(async () => {
    if (!enabled) return
    attemptingRef.current = false
    setStatus('disconnected')
    await backgroundConnect()
  }, [enabled, backgroundConnect])

  const logout = useCallback(async () => {
    if (!enabled) return
    try {
      await clientLogout()
    } finally {
      setAddress(null)
      setStatus('disconnected')
      setError(null)
    }
  }, [enabled])

  const value = useMemo<Web3ContextValue>(
    () => ({
      address,
      status,
      isConnected: status === 'connected' && address !== null,
      error,
      login,
      logout,
    }),
    [address, status, error, login, logout],
  )

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

/** Raw context accessor. Returns a disabled-mode fallback when no provider is mounted. */
export function useWeb3Context(): Web3ContextValue {
  const ctx = useContext(Web3Context)
  if (ctx) return ctx
  // Fallback keeps consumers safe if the provider isn't mounted (pure web2 mode).
  return {
    address: null,
    status: 'disabled',
    isConnected: false,
    error: null,
    login: async () => {},
    logout: async () => {},
  }
}
