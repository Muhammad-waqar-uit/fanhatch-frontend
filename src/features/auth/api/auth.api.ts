import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import type { AuthResponse, AuthUser, LoginInput } from '../types'

/** Small artificial delay so mock loading states are observable. */
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

/** A syntactically-valid unsigned JWT so mock mode still decodes a `sub`. */
function fakeToken(user: AuthUser): string {
  const encode = (obj: unknown) =>
    typeof btoa === 'function'
      ? btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      : ''
  const header = encode({ alg: 'none', typ: 'JWT' })
  const payload = encode({ sub: user.id, email: user.email, handle: user.handle, role: user.role })
  return `${header}.${payload}.mock`
}

function mockUser(email: string): AuthUser {
  return { id: 'mock-user-1', email, handle: 'alice', role: 'user' }
}

/** POST /auth/login → { accessToken, user }. */
export async function login(input: LoginInput): Promise<AuthResponse> {
  if (env.useMocks) {
    const user = mockUser(input.email)
    return delay({ accessToken: fakeToken(user), user })
  }
  return apiClient.post<unknown, AuthResponse>('/auth/login', input)
}

/** POST /auth/register → { accessToken, user }. */
export async function register(input: LoginInput): Promise<AuthResponse> {
  if (env.useMocks) {
    const user = mockUser(input.email)
    return delay({ accessToken: fakeToken(user), user })
  }
  return apiClient.post<unknown, AuthResponse>('/auth/register', input)
}

/** GET /auth/me → the authenticated principal. */
export async function getMe(): Promise<AuthUser> {
  if (env.useMocks) {
    return delay(mockUser('alice@fans.tech'))
  }
  return apiClient.get<unknown, AuthUser>('/auth/me')
}

/**
 * GET /auth/web3auth/token → a freshly minted Web3Auth SFA id-token for the current
 * session. Used on reload when we have an access token but the short-lived id-token
 * from the original login response is gone. Returns null in mock/web2 mode.
 */
export async function getWeb3AuthToken(): Promise<string | null> {
  if (env.useMocks) return null
  const res = await apiClient.get<unknown, { web3authToken: string }>('/auth/web3auth/token')
  return res?.web3authToken ?? null
}

/**
 * PATCH /users/me/wallet → persist the derived smart-account address. No-op in mock mode.
 * Returns the updated user (with `walletAddress`).
 */
export async function updateWalletAddress(walletAddress: string): Promise<AuthUser | null> {
  if (env.useMocks) return null
  return apiClient.patch<unknown, AuthUser>('/users/me/wallet', { walletAddress })
}
