'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/shared/lib/cn'
import { timeAgo } from '@/shared/lib/format'
import type { ChatMessage } from '../types'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function MessageItem({ message }: { message: ChatMessage }) {
  if (message.mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="rounded-[var(--radius)] bg-[var(--color-accent)] px-3 py-2 text-sm text-[var(--color-accent-fg)] break-words [overflow-wrap:anywhere]">
            {message.body}
          </div>
          <p className="mt-1 text-right text-[10px] text-[var(--color-muted)]">
            {timeAgo(message.sentAt)}
          </p>
        </div>
      </div>
    )
  }

  const profileHref = message.senderHandle ? `/u/${message.senderHandle}` : null

  const avatar = (
    <Avatar className="size-8">
      <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} />
      <AvatarFallback>{initials(message.senderName)}</AvatarFallback>
    </Avatar>
  )

  return (
    <div className="flex justify-start gap-2">
      {profileHref ? (
        <Link href={profileHref} className="cursor-pointer">
          {avatar}
        </Link>
      ) : (
        avatar
      )}
      <div className="max-w-[75%]">
        <div className="mb-1 flex items-center gap-2">
          {profileHref ? (
            <Link
              href={profileHref}
              className="cursor-pointer text-xs font-medium text-[var(--color-fg)] hover:underline"
            >
              {message.senderName}
            </Link>
          ) : (
            <span className="text-xs font-medium text-[var(--color-fg)]">{message.senderName}</span>
          )}
          <span className="text-[10px] text-[var(--color-muted)]">{timeAgo(message.sentAt)}</span>
        </div>
        <div
          className={cn(
            'rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-fg)] break-words [overflow-wrap:anywhere]',
          )}
        >
          {message.body}
        </div>
      </div>
    </div>
  )
}
