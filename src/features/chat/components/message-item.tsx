'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

/** "2:00 PM" style clock time from an ISO timestamp. */
function clockTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function MessageItem({ message }: { message: ChatMessage }) {
  if (message.mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[var(--color-accent)] px-4 py-2.5 text-sm text-[var(--color-accent-fg)]">
          <p className="break-words [overflow-wrap:anywhere]">{message.body}</p>
          <p className="mt-1 text-right text-[10px] text-[var(--color-accent-fg)]/70">
            {clockTime(message.sentAt)}
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
        <div className="mb-1">
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
        </div>
        <div className="rounded-2xl rounded-tl-md bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-fg)]">
          <p className="break-words [overflow-wrap:anywhere]">{message.body}</p>
          <p className="mt-1 text-right text-[10px] text-[var(--color-muted)]">
            {clockTime(message.sentAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
