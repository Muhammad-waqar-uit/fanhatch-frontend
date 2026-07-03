'use client'

/**
 * Web3Provider — React context exposing the Biconomy smart account + login lifecycle.
 *
 * EXPORTED but NOT mounted here (the orchestrator mounts it in app/providers.tsx).
 * When `web3Config.enabled` is false the provider still renders, but `login()` is a
 * no-op and `status` stays `'disabled'`, so consumers degrade gracefully to web2.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Address } from 'viem'
import { web3Config } from './config'
import { isWeb3Available, login as clientLogin, logout as clientLogout, restoreSession } from './client'

export type Web3Status = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error'

export interface Web3ContextValue {
  address: Address | null
  status: Web3Status
  isConnected: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

const Web3Context = createContext<Web3ContextValue | null>(null)

export function Web3Provider({ children }: { children: ReactNode }) {
  const enabled = web3Config.enabled
  const [address, setAddress] = useState<Address | null>(null)
  const [status, setStatus] = useState<Web3Status>(enabled ? 'disconnected' : 'disabled')
  const [error, setError] = useState<string | null>(null)
  const restoredRef = useRef(false)

  // Best-effort silent reconnect on mount when a Web3Auth session already exists.
  useEffect(() => {
    if (!enabled || restoredRef.current) return
    restoredRef.current = true
    if (!isWeb3Available()) return
    let cancelled = false
    void (async () => {
      try {
        const restored = await restoreSession()
        if (!cancelled && restored) {
          setAddress(restored.address)
          setStatus('connected')
        }
      } catch {
        // No existing session — stay disconnected silently.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const login = useCallback(async () => {
    if (!enabled) return
    setStatus('connecting')
    setError(null)
    try {
      const { address: addr } = await clientLogin()
      setAddress(addr)
      setStatus('connected')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
      setStatus('error')
    }
  }, [enabled])

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
