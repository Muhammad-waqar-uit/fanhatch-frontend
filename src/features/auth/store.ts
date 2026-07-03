import { create } from 'zustand'
import type { AuthUser } from './types'

const TOKEN_KEY = 'accessToken'

/** True on the client, false during SSR — guards all localStorage access. */
const isBrowser = () => typeof window !== 'undefined'

interface JwtPayload {
  sub?: string
  id?: string
  userId?: string
  email?: string
  handle?: string
  role?: string
}

/** Best-effort decode of a JWT payload; returns null on any malformed input. */
function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function' ? atob(base64) : ''
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed === 'object' && parsed !== null) return parsed as JwtPayload
    return null
  } catch {
    return null
  }
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  /**
   * Backend-minted Web3Auth SFA id-token from the login/register response.
   * In-memory only (short-lived, never persisted). On reload the Web3Provider
   * re-mints it via `GET /auth/web3auth/token`.
   */
  web3authToken: string | null
  /** Persist the token to localStorage and store the principal (+ id-token) in memory. */
  setAuth: (token: string, user: AuthUser, web3authToken?: string | null) => void
  /** Patch fields on the in-memory user (e.g. after deriving the wallet address). */
  setUser: (patch: Partial<AuthUser>) => void
  /** Clear the session and remove the persisted token. */
  logout: () => void
  /** Read the persisted token on the client, decoding a fallback user id. */
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  web3authToken: null,
  setAuth: (token, user, web3authToken = null) => {
    if (isBrowser()) localStorage.setItem(TOKEN_KEY, token)
    set({ token, user, web3authToken })
  },
  setUser: (patch) =>
    set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
  logout: () => {
    if (isBrowser()) localStorage.removeItem(TOKEN_KEY)
    set({ token: null, user: null, web3authToken: null })
  },
  hydrate: () => {
    if (!isBrowser()) return
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    const payload = decodeJwtPayload(token)
    const id = payload?.sub ?? payload?.id ?? payload?.userId
    const user: AuthUser | null = id
      ? { id, email: payload?.email, handle: payload?.handle, role: payload?.role }
      : null
    set({ token, user })
  },
}))
