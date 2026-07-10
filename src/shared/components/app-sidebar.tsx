'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'
import { ConnectButton } from '@/features/web3'
import { NAV_ITEMS } from '@/config/nav'
import { cn } from '@/shared/lib/cn'
import { LogoutDialog } from './logout-dialog'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleLogout = () => {
    setConfirmLogout(false)
    logout()
    router.push('/login')
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:flex">
      <div className="px-2 py-3 text-lg font-bold">
        Fans<span className="text-[var(--color-accent)]">.tech</span>
      </div>
      <nav className="mt-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
              {!item.ready && (
                <span className="ml-auto text-[10px] uppercase text-[var(--color-muted)]">soon</span>
              )}
            </Link>
          )
        })}
      </nav>
      {user ? (
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {/* Ask to connect only once signed in (MetaMask / WalletConnect). */}
          <ConnectButton className="w-full" />
          <div className="flex flex-col gap-2 rounded-[var(--radius)] bg-[var(--color-surface-2)] p-3">
            <div className="truncate text-sm font-medium text-[var(--color-fg)]">
              {user.handle ? `@${user.handle}` : (user.email ?? 'Signed in')}
            </div>
            <Button variant="outline" size="sm" onClick={() => setConfirmLogout(true)}>
              Logout
            </Button>
          </div>
          {confirmLogout ? (
            <LogoutDialog onConfirm={handleLogout} onClose={() => setConfirmLogout(false)} />
          ) : null}
        </div>
      ) : (
        <Link
          href="/login"
          className="mt-auto rounded-[var(--radius)] bg-[var(--color-surface-2)] p-3 text-center text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-border)]"
        >
          Login
        </Link>
      )}
    </aside>
  )
}
