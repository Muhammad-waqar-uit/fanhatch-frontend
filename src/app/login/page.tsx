import type { Metadata } from 'next'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoginForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Sign in — Fanhatch',
}

/** Standalone auth page (outside the (app) group, so no sidebar/topbar). */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-1 text-center">
          <div className="text-2xl font-bold">
            Fans<span className="text-[var(--color-accent)]">.tech</span>
          </div>
          <p className="text-sm text-[var(--color-muted)]">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
