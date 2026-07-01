'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createDm, searchUsers } from '../api/chat.api'
import { useChatStore } from '../store'

/**
 * Lightweight, dependency-free modal for starting a new DM. Radix Dialog is not
 * installed, so this is a fixed-overlay div styled with the design tokens; it
 * stays accessible via `role="dialog"`, a close button, and Escape-to-close.
 */
export function NewDmDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const selectRoom = useChatStore((s) => s.selectRoom)
  const queryClient = useQueryClient()

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Light debounce so we don't fire a search on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  const { data: users = [], isFetching } = useQuery({
    queryKey: ['chat', 'user-search', debounced],
    queryFn: () => searchUsers(debounced),
    enabled: debounced.length > 0,
  })

  const { mutate: startDm, isPending } = useMutation({
    mutationFn: (peerUserId: string) => createDm(peerUserId),
    onSuccess: (room) => {
      // Surface the new DM in the Users tab, select it, then close.
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      selectRoom(room.id)
      onClose()
    },
    onError: (error) => {
      console.error('[chat] failed to start DM', error)
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="New message"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">New message</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="p-4">
          {/* biome-ignore lint/a11y/noAutofocus: focusing the search field is the intent of the dialog */}
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            aria-label="Search people"
          />

          <ScrollArea className="mt-3 max-h-64">
            {debounced.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">
                Search for someone to message.
              </p>
            ) : isFetching ? (
              <p className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">Searching…</p>
            ) : users.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">
                No people found.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => startDm(user.id)}
                      className="flex w-full items-center gap-3 rounded-[var(--radius)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50"
                    >
                      <Avatar className="size-8">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                        ) : null}
                        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-[var(--color-fg)]">
                          {user.name}
                        </span>
                        {user.handle ? (
                          <span className="block truncate text-xs text-[var(--color-muted)]">
                            {user.handle}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
