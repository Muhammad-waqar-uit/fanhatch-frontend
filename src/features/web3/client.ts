'use client'

/**
 * Web3 client — Web3Auth **single-factor-auth (SFA)** → EOA provider → Biconomy smart account.
 *
 * Path choice: **background SFA**, not the PnP modal. The backend mints a custom id-token
 * (RS256 JWT, `web3authToken`) on email/password login; we feed that straight into
 * `web3auth.connect({ verifier, verifierId: <email>, idToken })` with **no user interaction**.
 * The derived Biconomy smart-account address IS the user's wallet.
 *
 * Mirrors `mvmnt-user-dashboard/src/lib/web3/web3AuthManager.ts` (SFA init + connect + session
 * restore). Everything is client-only and gated behind `web3Config.enabled`; when disabled (or
 * during SSR) every entry point is a safe no-op so the app stays pure web2.
 */

import { ethers } from 'ethers'
import type { Address, Hex } from 'viem'
import { web3Config } from './config'

// Types are imported lazily inside functions to keep these heavy SDKs out of the
// server bundle and to avoid evaluating them when web3 is disabled.
type BiconomySmartAccount = import('@biconomy/account').BiconomySmartAccountV2
type Web3AuthSfa = import('@web3auth/single-factor-auth').Web3Auth
type Eip1193Provider = { request(args: { method: string; params?: unknown[] | object }): Promise<unknown> }

export interface Web3Transaction {
  to: Address
  data?: Hex
  value?: bigint
}

/** Guard: web3 is usable (enabled flag + running in the browser). */
export function isWeb3Available(): boolean {
  return web3Config.enabled && typeof window !== 'undefined'
}

// ---- module-level singletons (browser only) ---------------------------------
let web3auth: Web3AuthSfa | null = null
let smartAccount: BiconomySmartAccount | null = null
let smartAccountAddress: Address | null = null
let initWeb3AuthPromise: Promise<Web3AuthSfa> | null = null
let connectInFlight: Promise<{ address: Address }> | null = null

function hexChainId(): string {
  return `0x${web3Config.chainId.toString(16)}`
}

/** Create + init the Web3Auth SFA instance (idempotent, single-flight). */
async function initWeb3Auth(): Promise<Web3AuthSfa> {
  if (web3auth) return web3auth
  if (initWeb3AuthPromise) return initWeb3AuthPromise

  initWeb3AuthPromise = (async () => {
    const { Web3Auth } = await import('@web3auth/single-factor-auth')
    const { CHAIN_NAMESPACES } = await import('@web3auth/base')
    const { EthereumPrivateKeyProvider } = await import('@web3auth/ethereum-provider')

    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: hexChainId(),
      rpcTarget: web3Config.rpcUrl,
      displayName: 'Ethereum Sepolia',
      blockExplorerUrl: 'https://sepolia.etherscan.io',
      ticker: 'ETH',
      tickerName: 'Ethereum',
    }

    const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } })

    const instance = new Web3Auth({
      clientId: web3Config.web3auth.clientId,
      // SFA takes the Torus network string directly (e.g. 'sapphire_devnet').
      web3AuthNetwork: web3Config.web3auth.network as never,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      privateKeyProvider: privateKeyProvider as any,
      usePnPKey: false,
      // 24h — matches the backend id-token lifetime; keeps the session across reloads.
      sessionTime: 86400,
    })

    await instance.init()
    web3auth = instance
    return instance
  })()

  try {
    return await initWeb3AuthPromise
  } finally {
    initWeb3AuthPromise = null
  }
}

/**
 * Build the Biconomy smart account from a Web3Auth EIP-1193 provider.
 * Uses an ethers v5 signer wrapper (ethers is a dep and is the signer type Biconomy v4
 * accepts most directly). Gas is sponsored via the configured paymaster when present.
 */
async function initSmartAccount(provider: Eip1193Provider): Promise<BiconomySmartAccount> {
  const { createSmartAccountClient } = await import('@biconomy/account')

  const ethersProvider = new ethers.providers.Web3Provider(provider as ethers.providers.ExternalProvider)
  const signer = ethersProvider.getSigner()

  const account = await createSmartAccountClient({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signer: signer as any,
    chainId: web3Config.chainId,
    bundlerUrl: web3Config.biconomy.bundlerUrl,
    biconomyPaymasterApiKey: web3Config.biconomy.paymasterKey || undefined,
    rpcUrl: web3Config.rpcUrl || undefined,
  })

  smartAccount = account
  smartAccountAddress = (await account.getAccountAddress()) as Address
  return account
}

/**
 * Background login: run SFA `connect()` with the backend-minted id-token, then spin up the
 * Biconomy smart account. Decodes the verifier id (email) from the token — mirrors mvmnt.
 * Single-flight so concurrent callers (mount effect + a manual reconnect) share one attempt.
 * Returns the smart-account address.
 */
export async function connectWithToken(idToken: string): Promise<{ address: Address }> {
  if (!isWeb3Available()) throw new Error('Web3 is not enabled')
  if (connectInFlight) return connectInFlight

  connectInFlight = (async () => {
    const { decodeToken } = await import('@web3auth/single-factor-auth')
    const instance = await initWeb3Auth()

    const { payload } = decodeToken<{ email?: string }>(idToken)
    const verifierId = payload?.email
    if (!verifierId) throw new Error('id-token has no email claim — cannot derive verifierId')

    // Reconnecting with a fresh token: drop any stale session first.
    if (instance.connected) {
      try {
        await instance.logout()
      } catch {
        // best-effort — proceed to connect regardless
      }
    }

    await instance.connect({
      verifier: web3Config.web3auth.verifier,
      verifierId,
      idToken,
    })

    const provider = instance.provider as unknown as Eip1193Provider | null
    if (!instance.connected || !provider) throw new Error('Web3Auth SFA connect failed')

    await initSmartAccount(provider)
    if (!smartAccountAddress) throw new Error('Smart account initialization failed')
    return { address: smartAccountAddress }
  })()

  try {
    return await connectInFlight
  } finally {
    connectInFlight = null
  }
}

/**
 * Reconnect the smart account if a Web3Auth SFA session was restored from storage
 * (page reload). No id-token needed — the SFA session key is persisted. Returns null
 * when there's no restorable session.
 */
export async function restoreSession(): Promise<{ address: Address } | null> {
  if (!isWeb3Available()) return null
  const instance = await initWeb3Auth()
  if (!instance.connected || !instance.provider) return null
  await initSmartAccount(instance.provider as unknown as Eip1193Provider)
  return smartAccountAddress ? { address: smartAccountAddress } : null
}

/** Tear down the Web3Auth session + smart account. */
export async function logout(): Promise<void> {
  if (!isWeb3Available()) return
  try {
    if (web3auth?.connected) await web3auth.logout()
  } finally {
    smartAccount = null
    smartAccountAddress = null
  }
}

export function getSmartAccount(): BiconomySmartAccount | null {
  return smartAccount
}

export function getSmartAccountAddress(): Address | null {
  return smartAccountAddress
}

/**
 * Send one or more transactions as a single sponsored userop and wait for the receipt.
 * Batching (approve + action) into one userop keeps it atomic and gasless.
 * Returns the on-chain transaction hash.
 */
export async function sendUserOp(txs: Web3Transaction | Web3Transaction[]): Promise<Hex> {
  if (!smartAccount) throw new Error('Smart account not connected — sign in first')

  const { PaymasterMode } = await import('@biconomy/account')

  const list = (Array.isArray(txs) ? txs : [txs]).map((t) => ({
    to: t.to,
    data: t.data,
    value: t.value,
  }))

  const useSponsorship = Boolean(web3Config.biconomy.paymasterKey)
  const response = await smartAccount.sendTransaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list as any,
    useSponsorship ? { paymasterServiceData: { mode: PaymasterMode.SPONSORED } } : undefined,
  )

  const receipt = await response.wait()
  return receipt.receipt.transactionHash as Hex
}
