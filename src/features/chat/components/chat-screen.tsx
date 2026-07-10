'use client'

import { Mail, MessagesSquare, Plus, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '../store'
import type { ChatTab } from '../types'
import { MessageThread } from './message-thread'
import { NewDmDialog } from './new-dm-dialog'
import { RoomList } from './room-list'

/** Circular action button with a label, used for the "My Room" / "Add Club" row. */
function CircleAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="flex size-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25">
        {icon}
      </span>
      <span className="text-xs font-medium text-[var(--color-fg)]">{label}</span>
    </button>
  )
}

/** Right-pane placeholder shown when no conversation is selected. */
function EmptyPane({ tab, onNewMessage }: { tab: ChatTab; onNewMessage: () => void }) {
  if (tab === 'users') {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <Mail className="size-6" />
        </span>
        <h3 className="text-lg font-semibold text-[var(--color-fg)]">No direct message yet</h3>
        <p className="max-w-sm text-sm text-[var(--color-muted)]">
          Direct messages are for private conversations with creators you support. Send your first
          message to start connecting.
        </p>
        <Button variant="secondary" size="sm" className="mt-2" onClick={onNewMessage}>
          Send a message
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <Send className="size-6" />
      </span>
      <h3 className="text-lg font-semibold text-[var(--color-fg)]">Select a conversation</h3>
      <p className="max-w-sm text-sm text-[var(--color-muted)]">
        Pick a Club from the left to jump into the chat, or buy a key to unlock new creator
        communities.
      </p>
    </div>
  )
}

export function ChatScreen() {
  const router = useRouter()
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const selectRoom = useChatStore((s) => s.selectRoom)
  const [tab, setTab] = useState<ChatTab>('users')
  const [dmDialogOpen, setDmDialogOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-4">
      <div className="flex items-start gap-8 px-2">
        <CircleAction
          icon={<MessagesSquare className="size-6" />}
          label="My Room"
          onClick={() => selectRoom(null)}
        />
        <CircleAction
          icon={<Plus className="size-6" />}
          label="Add Club"
          onClick={() => router.push('/create-club')}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <RoomList tab={tab} onTabChange={setTab} onNewMessage={() => setDmDialogOpen(true)} />
        <div className="flex min-w-0 flex-1 border-l border-[var(--color-border)]">
          {activeRoomId ? (
            <MessageThread key={activeRoomId} roomId={activeRoomId} />
          ) : (
            <EmptyPane tab={tab} onNewMessage={() => setDmDialogOpen(true)} />
          )}
        </div>
      </div>

      {dmDialogOpen ? <NewDmDialog onClose={() => setDmDialogOpen(false)} /> : null}
    </div>
  )
}
