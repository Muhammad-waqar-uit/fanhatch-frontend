// Public surface of the web3 feature.
// Auth + smart account + write actions (this file's owner) plus read hooks (Agent B).

export { web3Config } from './config'
export { Web3Provider, useWeb3Context, type Web3ContextValue, type Web3Status } from './provider'
export { useSmartAccount, type UseSmartAccount } from './use-smart-account'
export { ConnectButton } from './connect-button'
export {
  isWeb3Available,
  login,
  logout,
  restoreSession,
  getSmartAccount,
  getSmartAccountAddress,
  sendUserOp,
  type Web3Transaction,
} from './client'

// Write-action mutation hooks.
export * from './actions'

// Read hooks (owned by Agent B).
export * from './hooks'
