'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/shared/lib/format'
import { NEW_MEMBERS_COUNT } from '../mocks'

/** Referral hook: highlights new members and surfaces an invite-code CTA. */
export function NewMembersCard({ count = NEW_MEMBERS_COUNT }: { count?: number }) {
  return (
    <Card className="bg-[var(--color-surface)]">
      <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
        <div className="text-sm font-medium text-[var(--color-fg)]">Welcome to our new members</div>
        <div className="text-4xl font-bold leading-tight text-[var(--color-fg)]">{formatNumber(count)}</div>
        <div className="text-sm text-[var(--color-muted)]">Members on team</div>
        <Button variant="primary" size="sm" className="mt-2">
          Get your unique invite code
        </Button>
      </CardContent>
    </Card>
  )
}
