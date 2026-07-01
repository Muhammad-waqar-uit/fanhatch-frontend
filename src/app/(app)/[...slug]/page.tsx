import { Construction } from 'lucide-react'

/**
 * Catch-all for nav items that are specced but not built yet (Wallet, LP, Notifications,
 * Discover, Bookmarks, Premium, Referrals). Explicit routes (/, /chat) take precedence.
 */
export default async function ComingSoonPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const name = (slug?.[0] ?? 'screen').replace(/-/g, ' ')
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <Construction className="size-10 text-[var(--color-muted)]" />
      <h1 className="text-lg font-semibold capitalize">{name}</h1>
      <p className="max-w-sm text-sm text-[var(--color-muted)]">
        This screen is specced in <code>docs/</code> and planned next. Home and Chat are live.
      </p>
    </div>
  )
}
