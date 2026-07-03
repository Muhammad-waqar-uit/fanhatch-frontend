'use client'

import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { env } from '@/config/env'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoginMutation, useSiweMutation } from '../hooks/use-auth'
import { hasWallet } from '../siwe'

/** Turn a failed login/register into a human-readable message. */
function errorMessage(error: unknown, mode: 'login' | 'register'): string {
  if (isAxiosError(error) && error.response?.status === 401) {
    return 'Invalid email or password.'
  }
  return mode === 'register'
    ? 'Could not create your account. Please try again.'
    : 'Something went wrong. Please try again.'
}

/** Email + password form with a login/register toggle. */
export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  // Dev placeholders — the seed will have these creds.
  const [email, setEmail] = useState('alice@fans.tech')
  const [password, setPassword] = useState('password123')

  const mutation = useLoginMutation()
  const siwe = useSiweMutation()

  // Wallet detection is client-only (window.ethereum), so resolve after mount.
  const [walletReady, setWalletReady] = useState(false)
  useEffect(() => setWalletReady(hasWallet()), [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ email, password, mode })
  }

  const siweError = siwe.isError
    ? siwe.error instanceof Error
      ? siwe.error.message
      : 'Wallet sign-in failed. Please try again.'
    : null

  return (
    <div className="flex flex-col gap-4">
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-[var(--color-muted)]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alice@fans.tech"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-[var(--color-muted)]">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password123"
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{errorMessage(mutation.error, mode)}</p>
      )}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending
          ? 'Please wait…'
          : mode === 'register'
            ? 'Create account'
            : 'Sign in'}
      </Button>

      <button
        type="button"
        onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
        className="text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
      >
        {mode === 'login'
          ? "Don't have an account? Register"
          : 'Already have an account? Sign in'}
      </button>
    </form>

      {/* Wallet sign-in (SIWE). Hidden in mock mode — there's no real backend. */}
      {!env.useMocks && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            or
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={!walletReady || siwe.isPending}
            onClick={() => siwe.mutate()}
          >
            {siwe.isPending
              ? 'Check your wallet…'
              : walletReady
                ? 'Connect wallet'
                : 'No wallet detected'}
          </Button>

          {siweError && <p className="text-sm text-red-500">{siweError}</p>}
        </div>
      )}
    </div>
  )
}
