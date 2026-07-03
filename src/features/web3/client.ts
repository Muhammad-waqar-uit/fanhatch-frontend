'use client'

/**
 * Web3 client — Web3Auth (PnP modal) → EOA provider → Biconomy smart account.
 *
 * Path choice: **Web3Auth `@web3auth/modal` (Plug-n-Play)**, not single-factor-auth.
 * SFA (`@web3auth/single-factor-auth`) needs a custom verifier + an externally minted
 * id-token (the reference dashboard wires its own `mvmnt-dev` verifier + backend JWT).
 * We don't own that verifier infra here, so PnP modal is used — it works standalone with
 * only the `clientId`, letting Web3Auth host the social/email login flow itself.
 *
 * Everything is client-only and gated behind `web3Config.enabled`. When disabled (or during
 * SSR) every entry point is a safe no-op so the app stays pure web2.
 */

import { ethers } from 'ethers'
import type { Address, Hex } from 'viem'
import { web3Config } from './config'

// Types are imported lazily inside functions to keep these heavy SDKs out of the
// server bundle and to avoid evaluating them when web3 is disabled.
type BiconomySmartAccount = import('@biconomy/account').BiconomySmartAccountV2
type Web3AuthModal = import('@web3auth/modal').Web3Auth
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
let web3auth: Web3AuthModal | null = null
let smartAccount: BiconomySmartAccount | null = null
let smartAccountAddress: Address | null = null
let initWeb3AuthPromise: Promise<Web3AuthModal> | null = null

function hexChainId(): string {
  return `0x${web3Config.chainId.toString(16)}`
}

/** Create + init the Web3Auth PnP modal instance (idempotent, single-flight). */
async function initWeb3Auth(): Promise<Web3AuthModal> {
  if (web3auth) return web3auth
  if (initWeb3AuthPromise) return initWeb3AuthPromise

  initWeb3AuthPromise = (async () => {
    const { Web3Auth } = await import('@web3auth/modal')
    const { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } = await import('@web3auth/base')
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

    // Map the config's network string to the Web3Auth enum; default to sapphire_devnet.
    const networkMap: Record<string, (typeof WEB3AUTH_NETWORK)[keyof typeof WEB3AUTH_NETWORK]> = {
      sapphire_devnet: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      sapphire_mainnet: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      mainnet: WEB3AUTH_NETWORK.MAINNET,
      testnet: WEB3AUTH_NETWORK.TESTNET,
    }
    const web3AuthNetwork = networkMap[web3Config.web3auth.network] ?? WEB3AUTH_NETWORK.SAPPHIRE_DEVNET

    const instance = new Web3Auth({
      clientId: web3Config.web3auth.clientId,
      web3AuthNetwork,
      privateKeyProvider,
    })

    await instance.initModal()
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
 * Full login: open the Web3Auth modal, then spin up the Biconomy smart account.
 * Returns the smart-account address. No-op-throws when web3 is unavailable.
 */
export async function login(): Promise<{ address: Address }> {
  if (!isWeb3Available()) throw new Error('Web3 is not enabled')

  const instance = await initWeb3Auth()
  const provider = (await instance.connect()) as Eip1193Provider | null
  if (!provider) throw new Error('Web3Auth login was cancelled or failed')

  await initSmartAccount(provider)
  if (!smartAccountAddress) throw new Error('Smart account initialization failed')
  return { address: smartAccountAddress }
}

/** Reconnect the smart account if a Web3Auth session was restored (page reload). */
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
  if (!smartAccount) throw new Error('Smart account not connected — call login() first')

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
