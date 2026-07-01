'use client'

import { useEffect } from 'react'
import { useAuthStore } from '../store'

/**
 * Hydrates the auth store from localStorage once on mount. Renders its children
 * untouched — it exists purely for the side effect. Mount it high in the tree.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <>{children}</>
}
