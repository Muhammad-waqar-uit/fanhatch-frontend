'use client'

/**
 * ConnectButton — Web3Auth login trigger + connected state (short address + logout).
 * Renders nothing when web3 is disabled so it can be dropped anywhere safely.
 */

import { LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { web3Config } from './config'
import { useWeb3Context } from './provider'

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function ConnectButton({ className }: { className?: string }) {
  const { address, status, isConnected, error, login, logout } = useWeb3Context()

  if (!web3Config.enabled) return null

  if (isConnected && address) {
    return (
      <div className={className}>
        <Button variant="outline" size="sm" onClick={() => void logout()} title={address}>
          <Wallet />
          {shortAddress(address)}
          <LogOut />
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <Button
        variant="primary"
        size="sm"
        disabled={status === 'connecting'}
        onClick={() => void login()}
      >
        <Wallet />
        {status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
      </Button>
      {status === 'error' && error ? (
        <p className="mt-1 text-xs text-[var(--color-danger,#ef4444)]">{error}</p>
      ) : null}
    </div>
  )
}
