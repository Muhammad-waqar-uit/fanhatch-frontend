/**
 * EVM address helpers — truncation, checksum, and block-explorer links.
 *
 * The explorer base is derived from `web3Config.chainId` (Sepolia by default),
 * mirroring mvmnt-user-dashboard's `getExplorerLink` which sources the base URL
 * from the active chain.
 */
import { getAddress } from 'viem'
import { web3Config } from '@/features/web3/config'

/** Etherscan-family base URLs keyed by chain id. Sepolia is the default. */
const EXPLORER_BASE: Record<number, string> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
}

/** `"0x1234…abcd"` — keep `0x` + `chars` head and `chars` tail. */
export function truncateAddress(addr: string, chars = 4): string {
  if (!addr) return ''
  if (addr.length <= chars * 2 + 2) return addr
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`
}

/** EIP-55 checksummed address. Returns the input unchanged if it can't be parsed. */
export function toChecksum(addr: string): string {
  try {
    return getAddress(addr)
  } catch {
    return addr
  }
}

/** Block-explorer URL for an address or tx hash on the configured chain. */
export function explorerUrl(value: string, kind: 'address' | 'tx'): string {
  const base = EXPLORER_BASE[web3Config.chainId] ?? 'https://sepolia.etherscan.io'
  return `${base}/${kind}/${value}`
}
