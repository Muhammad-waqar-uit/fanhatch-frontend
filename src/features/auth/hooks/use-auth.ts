'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { login, register } from '../api/auth.api'
import { useAuthStore } from '../store'
import type { LoginInput } from '../types'

/** Read the current session (token + user) from the auth store. */
export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  return { token, user, isAuthenticated: Boolean(token), logout }
}

/**
 * Login (or register) mutation. On success, persists the session via the store
 * and redirects home. Pass `{ mode: 'register' }` to hit the register endpoint.
 */
export function useLoginMutation() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: ({ mode = 'login', ...input }: LoginInput & { mode?: 'login' | 'register' }) =>
      mode === 'register' ? register(input) : login(input),
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user)
      router.push('/')
    },
  })
}
