'use client'

/**
 * Wallet connect trigger — ConnectKit's `<ConnectKitButton />` (MetaMask + WalletConnect).
 * Renders nothing when web3 is disabled (pure web2 mode). `WalletChip` is kept as an alias
 * so existing sidebar imports keep working.
 */

import { ConnectKitButton } from 'connectkit'
import { web3Config } from './config'

export function ConnectButton({ className }: { className?: string }) {
  if (!web3Config.enabled) return null
  return (
    <div className={className}>
      <ConnectKitButton />
    </div>
  )
}

/** Alias — the sidebar imports `WalletChip`. */
export const WalletChip = ConnectButton
