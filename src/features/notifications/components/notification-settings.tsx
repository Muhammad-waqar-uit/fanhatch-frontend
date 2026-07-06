'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Coins,
  Gift,
  Key,
  Newspaper,
  Users,
  Vote,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useNotificationSettings, useUpdateSetting } from '../hooks'
import type { NotificationSetting, NotificationSettingType } from '../types'

/** Per-category copy for the settings toggles. */
const SETTING_ROWS: {
  type: NotificationSettingType
  icon: LucideIcon
  label: string
  description: string
}[] = [
  {
    type: 'KEY_ACTIVITY',
    icon: Key,
    label: 'Key activity',
    description: 'When someone buys or sells your keys.',
  },
  {
    type: 'GIFTS',
    icon: Gift,
    label: 'Gifts',
    description: 'When you receive a gifted club key.',
  },
  {
    type: 'GOVERNANCE',
    icon: Vote,
    label: 'Governance',
    description: 'Votes received and president elections.',
  },
  {
    type: 'NEW_POSTS',
    icon: Newspaper,
    label: 'New posts',
    description: 'Posts from clubs whose keys you hold.',
  },
  {
    type: 'SOCIAL',
    icon: Users,
    label: 'Social',
    description: 'Follows, likes, mentions and messages.',
  },
  {
    type: 'WALLET',
    icon: Coins,
    label: 'Wallet',
    description: 'Swaps and staking rewards.',
  },
]

export function NotificationSettings() {
  const { data: settings, isLoading } = useNotificationSettings()
  const update = useUpdateSetting()

  const statusOf = (type: NotificationSettingType) =>
    (settings as NotificationSetting[] | undefined)?.find((s) => s.type === type)?.status ?? false

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/notifications">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      <h1 className="text-lg font-semibold">Notification settings</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Choose which notifications you want to receive. Welcome and system messages always arrive.
      </p>

      <div className="mt-6 divide-y divide-[var(--color-border)] rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {SETTING_ROWS.map((row) => {
          const Icon = row.icon
          const checked = statusOf(row.type)
          return (
            <div key={row.type} className="flex items-center gap-4 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                <Icon className="size-4 text-[var(--color-accent)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-[var(--color-muted)]">{row.description}</p>
              </div>
              <Switch
                id={`setting-${row.type}`}
                checked={checked}
                disabled={isLoading}
                onCheckedChange={(status) => update.mutate({ type: row.type, status })}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
