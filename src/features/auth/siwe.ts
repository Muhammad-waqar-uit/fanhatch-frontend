import { apiClient } from '@/shared/api/client'
import type { AuthResponse } from './types'

/**
 * Minimal EIP-1193 provider surface we rely on (MetaMask & friends inject this
 * as `window.ethereum`). Intentionally tiny — no wagmi/ethers/viem.
 */
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum
  return eth ?? null
}

/** True when an injected wallet is available to sign with. */
export function hasWallet(): boolean {
  return getProvider() !== null
}

/**
 * Build an EIP-4361 (SIWE) message by hand — keeps the bundle lean (no `siwe`
 * dep on the client). The line format below must match what the backend's
 * `new SiweMessage(message)` parser expects.
 *
 * NOTE: `address` must be EIP-55 checksummed; the backend's SIWE parser rejects
 * a lowercase address. MetaMask returns checksummed addresses from
 * `eth_requestAccounts`, so we use the wallet's value verbatim.
 */
function buildSiweMessage(params: {
  domain: string
  address: string
  uri: string
  chainId: number
  nonce: string
}): string {
  const { domain, address, uri, chainId, nonce } = params
  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    'Sign in to Fans.tech',
    '',
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join('\n')
}

/**
 * Full connect → challenge → sign → verify flow. Returns the same
 * `{ accessToken, user }` shape as email login so the caller can persist it
 * through the shared auth store.
 */
export async function connectAndSignIn(): Promise<AuthResponse> {
  const provider = getProvider()
  if (!provider) {
    throw new Error('No Ethereum wallet found. Install MetaMask to sign in with your wallet.')
  }

  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
  const address = accounts?.[0]
  if (!address) throw new Error('No wallet account was authorized.')

  // 1) Ask the backend for a single-use nonce.
  const { nonce } = await apiClient.get<unknown, { nonce: string }>('/auth/siwe/nonce')

  // 2) Build + sign the SIWE message (EIP-191 personal_sign).
  const message = buildSiweMessage({
    domain: window.location.host,
    address,
    uri: window.location.origin,
    // Sepolia — matches the backend/chain config (CHAIN_ID=11155111).
    chainId: 11155111,
    nonce,
  })
  const signature = (await provider.request({
    method: 'personal_sign',
    params: [message, address],
  })) as string

  // 3) Verify → JWT + user (same shape as POST /auth/login).
  return apiClient.post<unknown, AuthResponse>('/auth/siwe/verify', { message, signature })
}
