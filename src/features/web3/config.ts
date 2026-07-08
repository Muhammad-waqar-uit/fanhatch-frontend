/**
 * Shared web3 config — deployed contract addresses + chain + the wagmi/ConnectKit config.
 *
 * `web3Config` holds plain constants (enabled flag, chain, rpc, addresses) read across the
 * whole web3 feature. `wagmiConfig` is the wagmi v2 config via ConnectKit's `getDefaultConfig`
 * (MetaMask/injected + WalletConnect for other wallets; plain EOA — no smart account).
 */
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

type Hex = `0x${string}`

export const web3Config = {
  /** Master switch — false = pure web2 (no wallet, no on-chain actions). */
  enabled: process.env.NEXT_PUBLIC_WEB3_ENABLED === 'true',
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? '',
  addresses: {
    fans: process.env.NEXT_PUBLIC_FANS_ADDRESS as Hex,
    clubFactory: process.env.NEXT_PUBLIC_CLUB_FACTORY_ADDRESS as Hex,
    /** @deprecated Legacy FansSwap AMM — superseded by the Uniswap v4 hybrid (fansV4Router + fansLpVault). Kept for reference only. */
    fansSwap: process.env.NEXT_PUBLIC_FANS_SWAP_ADDRESS as Hex,
    feeDistributor: process.env.NEXT_PUBLIC_FEE_DISTRIBUTOR_ADDRESS as Hex,
    governance: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Hex,
    stakingFans: process.env.NEXT_PUBLIC_STAKING_FANS_ADDRESS as Hex,
    stakingLp: process.env.NEXT_PUBLIC_STAKING_LP_ADDRESS as Hex,
    clubKeyBeacon: process.env.NEXT_PUBLIC_CLUB_KEY_BEACON_ADDRESS as Hex,
    // Uniswap v4 hybrid — deployed swap/liquidity stack (Sepolia).
    poolManager: process.env.NEXT_PUBLIC_POOL_MANAGER_ADDRESS as Hex,
    fansHook: process.env.NEXT_PUBLIC_FANS_HOOK_ADDRESS as Hex,
    fansV4Router: process.env.NEXT_PUBLIC_FANS_V4_ROUTER_ADDRESS as Hex,
    fansLpVault: process.env.NEXT_PUBLIC_FANS_LP_VAULT_ADDRESS as Hex,
  },
} as const

/**
 * wagmi v2 config via ConnectKit's `getDefaultConfig` — MetaMask/injected + WalletConnect
 * (for other wallets). `walletConnectProjectId` comes from env; empty in dev (MetaMask still
 * works), and required for the full WalletConnect wallet list once you add a project id.
 */
export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(web3Config.rpcUrl || undefined),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
    appName: 'Fans.tech',
    ssr: true,
  }),
)

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
