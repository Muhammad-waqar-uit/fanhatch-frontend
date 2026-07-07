// Public surface of the web3 feature.
// wagmi/ConnectKit wallet + write actions plus read hooks.

export { web3Config, wagmiConfig } from './config'
export { Web3Provider, useWeb3Context, useWallet, type Web3ContextValue, type Web3Status } from './provider'
export { useSmartAccount, type UseSmartAccount } from './use-smart-account'
export { ConnectButton, WalletChip } from './connect-button'

// Write-action mutation hooks.
export * from './actions'

// Read hooks.
export * from './hooks'
