import type { ReactNode } from 'react'
import { AppShell } from '@/shared/components/app-shell'

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
