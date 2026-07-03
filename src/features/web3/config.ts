/**
 * Shared web3 config — deployed contract addresses + chain + Web3Auth/Biconomy env.
 * Plain constants (no viem import) so it compiles independently. Read by the whole web3 feature.
 */
type Hex = `0x${string}`

export const web3Config = {
  /** Master switch — false = pure web2 (no wallet, no on-chain actions). */
  enabled: process.env.NEXT_PUBLIC_WEB3_ENABLED === 'true',
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? '',
  web3auth: {
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? '',
    network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK ?? 'sapphire_devnet',
    // Custom JWT verifier configured in the Web3Auth dashboard (validates our backend id-token).
    verifier: process.env.NEXT_PUBLIC_WEB3AUTH_VERIFIER ?? 'fanstech-dev',
  },
  biconomy: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL ?? '',
    paymasterKey: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_KEY ?? '',
  },
  addresses: {
    fans: process.env.NEXT_PUBLIC_FANS_ADDRESS as Hex,
    clubFactory: process.env.NEXT_PUBLIC_CLUB_FACTORY_ADDRESS as Hex,
    fansSwap: process.env.NEXT_PUBLIC_FANS_SWAP_ADDRESS as Hex,
    feeDistributor: process.env.NEXT_PUBLIC_FEE_DISTRIBUTOR_ADDRESS as Hex,
    governance: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Hex,
    stakingFans: process.env.NEXT_PUBLIC_STAKING_FANS_ADDRESS as Hex,
    stakingLp: process.env.NEXT_PUBLIC_STAKING_LP_ADDRESS as Hex,
    clubKeyBeacon: process.env.NEXT_PUBLIC_CLUB_KEY_BEACON_ADDRESS as Hex,
  },
} as const
