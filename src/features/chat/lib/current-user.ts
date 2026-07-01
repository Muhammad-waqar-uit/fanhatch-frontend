import { useAuthStore } from '@/features/auth/store'
import { MOCK_CURRENT_USER_ID } from '../mocks'

/**
 * Resolves the signed-in user's id so messages can be flagged as `mine`.
 *
 * Prefers the auth store's user id (set on login / hydrate), falling back to a
 * lightweight decode of the `accessToken` JWT payload (`sub`/`id`/`userId`), and
 * finally the mock id during SSR / when no token is present.
 */
interface JwtPayload {
  sub?: string
  id?: string
  userId?: string
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function' ? atob(base64) : ''
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as JwtPayload
    }
    return null
  } catch {
    return null
  }
}

export function getCurrentUserId(): string {
  const storeUserId = useAuthStore.getState().user?.id
  if (storeUserId) return storeUserId
  if (typeof window === 'undefined') return MOCK_CURRENT_USER_ID
  const token = localStorage.getItem('accessToken')
  if (!token) return MOCK_CURRENT_USER_ID
  const payload = decodeJwtPayload(token)
  return payload?.sub ?? payload?.id ?? payload?.userId ?? MOCK_CURRENT_USER_ID
}
