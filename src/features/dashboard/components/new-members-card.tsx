'use client'

import { Gift, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/shared/lib/format'
import { NEW_MEMBERS_COUNT } from '../mocks'

/** Referral hook: highlights new members and surfaces an invite-code CTA. */
export function NewMembersCard({ count = NEW_MEMBERS_COUNT }: { count?: number }) {
  return (
    <Card className="bg-[var(--color-surface)]">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
          <Users className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-semibold leading-tight text-[var(--color-fg)]">
            {formatNumber(count)}
          </div>
          <div className="text-sm text-[var(--color-muted)]">Welcome to our new members</div>
        </div>
        <Button variant="primary" size="sm" className="shrink-0">
          <Gift className="size-4" />
          Get your unique invite code
        </Button>
      </CardContent>
    </Card>
  )
}
