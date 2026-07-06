import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { NotificationBell } from '@/features/notifications'
import { AppSidebar } from './app-sidebar'

/** App chrome: left nav + top search bar + content slot. Used by the (app) route group. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input placeholder="Find friends or clubs" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
