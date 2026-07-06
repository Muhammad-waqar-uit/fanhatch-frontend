'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/shared/lib/cn'
import { NOTIFICATION_CONFIG } from '../config'
import { useDeleteNotification, useMarkRead, useNotification } from '../hooks'

/** Single-notification view with generic per-type render + a deep-link CTA. */
export function NotificationDetail({ id }: { id: string }) {
  const { data: notification, isLoading, isError } = useNotification(id)
  const markRead = useMarkRead()
  const del = useDeleteNotification()

  // Mark read on open (once loaded and still unread).
  useEffect(() => {
    if (notification && notification.status === 'UNREAD') markRead.mutate(notification.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-surface-2)]" />
        <div className="h-24 w-full animate-pulse rounded bg-[var(--color-surface-2)]" />
      </div>
    )
  }

  if (isError || !notification) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 p-12 text-center">
        <p className="text-sm text-[var(--color-muted)]">This notification is no longer available.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/notifications">Back to notifications</Link>
        </Button>
      </div>
    )
  }

  const cfg = NOTIFICATION_CONFIG[notification.type]
  const Icon = cfg.icon
  const title = notification.title || cfg.title(notification.data)
  const body = notification.body ?? cfg.body(notification.data)
  const avatarUrl = notification.data.actorAvatarUrl

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/notifications">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex gap-4">
          <div className="relative size-[52px] shrink-0">
            {avatarUrl ? (
              <Avatar className="size-[52px]">
                <AvatarImage src={avatarUrl} alt="" />
                <AvatarFallback>
                  <Icon className={cn('size-5', cfg.accent)} />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex size-[52px] items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                <Icon className={cn('size-5', cfg.accent)} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold">{title}</h1>
            {body && <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>}
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Button asChild>
            <Link href={cfg.href(notification.data)}>
              View
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => del.mutate(notification.id)}
            disabled={del.isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
