'use client'

/**
 * "Your wallet" card — the connected wallet address (MetaMask via ConnectKit), shown
 * prominently on the Wallet screen. Prefers the live address (from wagmi); falls back to the
 * persisted `user.walletAddress`. Renders nothing when web3 is disabled or no address exists
 * (pure web2 / mock mode is unaffected).
 */

import { useState } from 'react'
import { Check, Copy, ExternalLink, Wallet } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useWeb3Context, web3Config } from '@/features/web3'
import { Card } from '@/components/ui/card'
import { explorerUrl, truncateAddress } from '@/shared/lib/address'
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard'

export function WalletAddressCard() {
  const { address: liveAddress, status } = useWeb3Context()
  const { user } = useAuth()
  const { copied, copy } = useCopyToClipboard()
  const [expanded, setExpanded] = useState(false)

  if (!web3Config.enabled) return null

  const address = liveAddress ?? user?.walletAddress ?? null

  // Still deriving the wallet in the background — show a subtle placeholder.
  if (!address) {
    if (status === 'connecting') {
      return (
        <Card className="flex items-center gap-3 p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <Wallet className="size-4 animate-pulse text-[var(--color-accent)]" />
          </div>
          <div>
            <div className="text-xs font-medium text-[var(--color-muted)]">Your wallet</div>
            <div className="text-sm text-[var(--color-muted)]">Creating your wallet…</div>
          </div>
        </Card>
      )
    }
    return null
  }

  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <Wallet className="size-4 text-[var(--color-accent)]" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-[var(--color-muted)]">Your wallet</div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title={address}
          className="block max-w-full truncate font-mono text-sm text-[var(--color-fg)] hover:text-[var(--color-accent)]"
        >
          {expanded ? address : truncateAddress(address)}
        </button>
      </div>
      <a
        href={explorerUrl(address, 'address')}
        target="_blank"
        rel="noreferrer"
        aria-label="View wallet on block explorer"
        className="ml-auto flex items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
      >
        <ExternalLink className="size-3.5" />
        <span>Explorer</span>
      </a>
      <button
        type="button"
        onClick={() => void copy(address)}
        aria-label="Copy wallet address"
        className="flex items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </Card>
  )
}
