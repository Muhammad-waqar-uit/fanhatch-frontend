'use client'

import { Input } from '@/components/ui/input'
import type { ClubSocials } from '../types'

/** Optional social accounts to display for the club token. */
export function SocialsFields({
  value,
  onChange,
}: {
  value: ClubSocials
  onChange: (next: ClubSocials) => void
}) {
  const set = (key: keyof ClubSocials) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value })

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">
        Optional: Social accounts to display for tokens
      </h3>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">X account to display for tokens</span>
        <Input
          value={value.x ?? ''}
          onChange={set('x')}
          placeholder="@username"
          autoComplete="off"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">Email account to display for token</span>
        <Input
          type="email"
          value={value.email ?? ''}
          onChange={set('email')}
          placeholder="@username"
          autoComplete="off"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">Website to display for token</span>
        <Input
          type="url"
          value={value.website ?? ''}
          onChange={set('website')}
          placeholder="https://example.com"
          autoComplete="off"
        />
      </label>
    </div>
  )
}
