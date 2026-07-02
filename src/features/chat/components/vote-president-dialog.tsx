'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Crown, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getPresidentStanding, searchUsers, voteForPresident } from '../api/chat.api'
import type { ChatRoom, UserCard, VoteResult } from '../types'

/** Pull a human-readable message off a failed vote (axios 400 body or Error). */
function voteErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined
    const message = data?.message
    if (Array.isArray(message)) return message[0]
    if (message) return message
  }
  if (error instanceof Error) return error.message
  return 'Could not cast your vote. Please try again.'
}

/**
 * Lightweight, dependency-free modal for the club president governance vote.
 * Mirrors `GiftKeyDialog`'s overlay pattern (Radix Dialog is not installed): a
 * fixed overlay styled with design tokens, `role="dialog"`, a close button and
 * Escape / overlay-click to close. Only meaningful for club rooms, so the caller
 * guarantees `room.clubId` is set.
 */
export function VotePresidentDialog({ room, onClose }: { room: ChatRoom; onClose: () => void }) {
  const clubId = room.clubId ?? ''
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selected, setSelected] = useState<UserCard | null>(null)

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

  const standingKey = ['chat', 'president', clubId]

  const { data: state, isLoading: standingsLoading } = useQuery({
    queryKey: standingKey,
    queryFn: () => getPresidentStanding(clubId),
    enabled: clubId.length > 0,
  })

  const { data: users = [], isFetching } = useQuery({
    queryKey: ['chat', 'user-search', debounced],
    queryFn: () => searchUsers(debounced),
    enabled: debounced.length > 0,
  })

  const {
    mutate: castVote,
    isPending,
    error,
    data: result,
    reset,
  } = useMutation<VoteResult, unknown, void>({
    mutationFn: () => voteForPresident(clubId, selected?.id ?? ''),
    onSuccess: () => {
      // Refresh standings after a successful vote.
      queryClient.invalidateQueries({ queryKey: standingKey })
    },
  })

  const president = state?.president ?? null
  const standings = state?.standings ?? []
  const canVote = Boolean(selected) && !isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Vote for president"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Vote for president</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="p-4">
          {/* Current president */}
          <div className="mb-3 flex items-center gap-2 rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2">
            <Crown className="size-4 text-[var(--color-accent)]" />
            {president ? (
              <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-fg)]">
                {president.name}{' '}
                <span className="text-[var(--color-muted)]">{president.handle}</span>
              </span>
            ) : (
              <span className="flex-1 text-sm text-[var(--color-muted)]">
                No president elected yet.
              </span>
            )}
          </div>

          {/* Standings */}
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Standings
          </p>
          <ScrollArea className="max-h-40">
            {standingsLoading ? (
              <p className="px-1 py-4 text-center text-sm text-[var(--color-muted)]">
                Loading standings…
              </p>
            ) : standings.length === 0 ? (
              <p className="px-1 py-4 text-center text-sm text-[var(--color-muted)]">
                No votes cast yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {standings.map((s) => (
                  <li
                    key={s.candidate.id}
                    className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-1.5"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback>
                        {s.candidate.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-fg)]">
                      {s.candidate.name}
                    </span>
                    <Badge>
                      {s.votes} vote{s.votes === 1 ? '' : 's'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          {result ? (
            <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)]">
                <Trophy className="size-5" />
              </span>
              <p className="text-sm font-medium text-[var(--color-fg)]">
                {result.elected
                  ? `🏆 ${selected?.name} is now president`
                  : `Vote counted — ${result.votes} vote${result.votes === 1 ? '' : 's'}`}
              </p>
              <Button className="mt-1 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-1 mt-4 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                Cast your vote
              </p>
              {/* biome-ignore lint/a11y/noAutofocus: focusing the search field is the intent of the dialog */}
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a candidate…"
                aria-label="Search a candidate"
              />

              <ScrollArea className="mt-3 max-h-40">
                {debounced.length === 0 ? (
                  <p className="px-1 py-4 text-center text-sm text-[var(--color-muted)]">
                    Search for someone to vote for.
                  </p>
                ) : isFetching ? (
                  <p className="px-1 py-4 text-center text-sm text-[var(--color-muted)]">
                    Searching…
                  </p>
                ) : users.length === 0 ? (
                  <p className="px-1 py-4 text-center text-sm text-[var(--color-muted)]">
                    No candidates found.
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
                              isSelected
                                ? 'bg-[var(--color-surface-2)] ring-1 ring-[var(--color-accent)]'
                                : ''
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
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </ScrollArea>

              {error ? (
                <p className="mt-3 text-sm text-[var(--color-danger,#ef4444)]">
                  {voteErrorMessage(error)}
                </p>
              ) : null}

              <Button className="mt-4 w-full" disabled={!canVote} onClick={() => castVote()}>
                {isPending ? 'Voting…' : selected ? `Vote for ${selected.name}` : 'Vote'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
