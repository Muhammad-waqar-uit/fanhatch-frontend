'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { useState, type ReactNode } from 'react'
import { AuthProvider } from '@/features/auth'
import { Web3Provider } from '@/features/web3'

/**
 * Global client providers. Wagmi (via `Web3Provider`) sits outside the single
 * QueryClient; ConnectKit is mounted just inside it, then AuthProvider + app.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  )

  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </Web3Provider>
  )
}
