'use client'

/**
 * WalletChip — compact background-wallet status shown in the sidebar.
 *
 * There is no "Connect wallet" button anymore: the smart account is derived silently from
 * the email/password session (SFA). This chip only *reflects* that state — short address +
 * copy when connected, a subtle "creating wallet…" hint while connecting, a tiny retry
 * affordance if init failed, and nothing at all when disabled/disconnected.
 */

import { useState } from 'react'
import { Check, Copy, RotateCw, Wallet } from 'lucide-react'
import { web3Config } from './config'
import { useWeb3Context } from './provider'

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function WalletChip({ className }: { className?: string }) {
  const { address, status, isConnected, login } = useWeb3Context()
  const [copied, setCopied] = useState(false)

  if (!web3Config.enabled) return null

  const copy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard blocked — ignore
    }
  }

  if (isConnected && address) {
    return (
      <div className={className}>
        <div
          className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-xs"
          title={address}
        >
          <Wallet className="size-3.5 text-[var(--color-accent)]" />
          <span className="font-mono text-[var(--color-fg)]">{shortAddress(address)}</span>
          <button
            type="button"
            onClick={() => void copy()}
            className="ml-auto text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            aria-label="Copy wallet address"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'connecting') {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
          <Wallet className="size-3.5 animate-pulse" />
          <span>Creating wallet…</span>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => void login()}
          className="flex w-full items-center gap-2 rounded-[var(--radius)] border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        >
          <RotateCw className="size-3.5" />
          <span>Retry wallet</span>
        </button>
      </div>
    )
  }

  return null
}
