'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { giftKey, searchUsers } from '../api/chat.api'
import type { ChatRoom, GiftKeyResult, UserCard } from '../types'

/** Pull a human-readable message off a failed gift (axios 400 body or Error). */
function giftErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined
    const message = data?.message
    if (Array.isArray(message)) return message[0]
    if (message) return message
  }
  if (error instanceof Error) return error.message
  return 'Could not gift the key. Please try again.'
}

/**
 * Lightweight, dependency-free modal for gifting a club key. Mirrors the
 * `NewDmDialog` overlay pattern (Radix Dialog is not installed): a fixed overlay
 * styled with design tokens, `role="dialog"`, a close button and Escape-to-close.
 * Only meaningful for club rooms, so `room.clubId` is required by the caller.
 */
export function GiftKeyDialog({ room, onClose }: { room: ChatRoom; onClose: () => void }) {
  const clubId = room.clubId ?? ''
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selected, setSelected] = useState<UserCard | null>(null)
  const [amount, setAmount] = useState(1)

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

  const {
    mutate: sendGift,
    isPending,
    error,
    data: result,
    reset,
  } = useMutation<GiftKeyResult, unknown, void>({
    mutationFn: () => giftKey(clubId, selected?.id ?? '', amount),
  })

  const canGift = Boolean(selected) && amount >= 1 && !isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Gift a key"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Gift a key</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="p-4">
          {result ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)]">
                <Check className="size-5" />
              </span>
              <p className="text-sm font-medium text-[var(--color-fg)]">
                Gifted {amount} key{amount > 1 ? 's' : ''} to {selected?.name}.
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                They now hold {result.to.keyCount} key
                {result.to.keyCount === 1 ? '' : 's'} in {room.name}.
              </p>
              <Button className="mt-1 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* biome-ignore lint/a11y/noAutofocus: focusing the search field is the intent of the dialog */}
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people…"
                aria-label="Search people"
              />

              <ScrollArea className="mt-3 max-h-56">
                {debounced.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">
                    Search for someone to gift a key.
                  </p>
                ) : isFetching ? (
                  <p className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">
                    Searching…
                  </p>
                ) : users.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">
                    No people found.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {users.map((user) => {
                      const isSelected = selected?.id === user.id
                      return (
                        <li key={user.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelected(user)
                              reset()
                            }}
                            className={`flex w-full items-center gap-3 rounded-[var(--radius)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-surface-2)] ${
                              isSelected ? 'bg-[var(--color-surface-2)] ring-1 ring-[var(--color-accent)]' : ''
                            }`}
                          >
                            <Avatar className="size-8">
                              {user.avatarUrl ? (
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                              ) : null}
                              <AvatarFallback>
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-[var(--color-fg)]">
                                {user.name}
                              </span>
                              {user.handle ? (
                                <span className="block truncate text-xs text-[var(--color-muted)]">
                                  {user.handle}
                                </span>
                              ) : null}
                            </span>
                            {isSelected ? (
                              <Check className="size-4 text-[var(--color-accent)]" />
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </ScrollArea>

              <div className="mt-3 flex items-center gap-2">
                <label htmlFor="gift-amount" className="text-sm text-[var(--color-muted)]">
                  Amount
                </label>
                <Input
                  id="gift-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20"
                  aria-label="Number of keys to gift"
                />
              </div>

              {error ? (
                <p className="mt-3 text-sm text-[var(--color-danger,#ef4444)]">
                  {giftErrorMessage(error)}
                </p>
              ) : null}

              <Button
                className="mt-4 w-full"
                disabled={!canGift}
                onClick={() => sendGift()}
              >
                {isPending ? 'Gifting…' : 'Gift'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
