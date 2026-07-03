/**
 * Small helpers for branching chat key-actions between the on-chain web3 path and
 * the web2 API fallback. Kept dependency-light so components stay readable.
 */
import type { Address } from 'viem'

/**
 * Parse a backend `clubId` string into an on-chain `uint256`, or `null` when it is
 * not a plain non-negative integer (e.g. the mock `'club-fanstech'` ids). Callers
 * use `null` as the signal to stay on the web2 path.
 */
export function toClubIdBig(clubId?: string): bigint | null {
  if (!clubId || !/^\d+$/.test(clubId)) return null
  try {
    return BigInt(clubId)
  } catch {
    return null
  }
}

/** Narrow a string to a checksum-agnostic `0x…40` EVM address, or `null`. */
export function asAddress(value?: string): Address | null {
  return value && /^0x[0-9a-fA-F]{40}$/.test(value) ? (value as Address) : null
}

/**
 * Human-readable message from an on-chain/tx error. Prefers viem's `shortMessage`
 * (e.g. the revert reason) over the verbose `message`, so a fresh-testnet
 * "insufficient $FANS" revert surfaces cleanly.
 */
export function txErrorMessage(
  error: unknown,
  fallback = 'Transaction failed. Please try again.',
): string {
  if (error && typeof error === 'object') {
    const e = error as { shortMessage?: string; message?: string }
    if (e.shortMessage) return e.shortMessage
    if (e.message) return e.message
  }
  return fallback
}
