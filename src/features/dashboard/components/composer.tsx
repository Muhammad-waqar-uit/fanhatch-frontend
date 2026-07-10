'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  CalendarClock,
  Globe,
  Hash,
  Image as ImageIcon,
  Images,
  Instagram,
  Linkedin,
  MapPin,
  MonitorPlay,
  Plus,
  Smile,
  Twitter,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/lib/cn'
import { timeAgo } from '@/shared/lib/format'
import { createPost } from '../api/dashboard.api'
import { useMyPosts } from '../hooks/use-my-posts'
import { useDeletePost, usePublishNow, useUpdatePost } from '../hooks/use-post-mutations'
import type { Post } from '../types'

const PLATFORMS = [
  { id: 'x', label: 'X', icon: Twitter },
  { id: 'kick', label: 'Kick', icon: MonitorPlay },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'farcaster', label: 'Farcaster', icon: Hash },
  { id: 'lens', label: 'Lens', icon: Globe },
] as const

/** Convert an ISO string to a `datetime-local` input value (local time, no tz). */
function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** True when a `datetime-local` value parses to a moment in the future. */
function isFuture(localValue: string): boolean {
  const t = new Date(localValue).getTime()
  return Number.isFinite(t) && t > Date.now()
}

/** Human "in 2d 3h" / "in 5m" style countdown to a future ISO time. */
function countdown(iso?: string): string {
  if (!iso) return ''
  const diff = new Date(iso).getTime() - Date.now()
  if (!Number.isFinite(diff)) return ''
  if (diff <= 0) return 'due now'
  const mins = Math.floor(diff / 60_000)
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const rem = mins % 60
  if (days > 0) return `in ${days}d ${hours}h`
  if (hours > 0) return `in ${hours}h ${rem}m`
  return `in ${Math.max(1, rem)}m`
}

function PlatformChip({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof Twitter
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md border transition-colors',
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]',
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

/** Compose toolbar affordance (media, emoji, schedule, location). */
function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Twitter
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-2)]',
        active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

/** Small transparent action link used inside list rows. */
function RowAction({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-xs font-medium transition-colors disabled:opacity-40',
        danger ? 'text-[var(--color-danger,#ef4444)] hover:opacity-80' : 'text-[var(--color-accent)] hover:opacity-80',
      )}
    >
      {children}
    </button>
  )
}

export function Composer() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('post')
  const [body, setBody] = useState('')
  const [crossPost, setCrossPost] = useState<string[]>(['x'])
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleAt, setScheduleAt] = useState('')
  // Inline reschedule editor state (scheduled tab).
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleValue, setRescheduleValue] = useState('')

  const scheduled = useMyPosts('scheduled')
  const drafts = useMyPosts('draft')
  const scheduledPosts = scheduled.data ?? []
  const draftPosts = drafts.data ?? []

  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()
  const publishNow = usePublishNow()

  const togglePlatform = (id: string) =>
    setCrossPost((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const willSchedule = showSchedule && scheduleAt.trim().length > 0
  const scheduleInvalid = willSchedule && !isFuture(scheduleAt)

  const create = useMutation({
    mutationFn: () =>
      createPost({
        body,
        crossPostTo: crossPost,
        status: willSchedule ? 'scheduled' : 'published',
        scheduledAt: willSchedule ? new Date(scheduleAt).toISOString() : undefined,
      }),
    onSuccess: () => {
      setBody('')
      setCrossPost([])
      setScheduleAt('')
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
    },
  })

  const saveDraft = useMutation({
    mutationFn: () => createPost({ body, crossPostTo: crossPost, status: 'draft' }),
    onSuccess: () => {
      setBody('')
      setCrossPost([])
      setScheduleAt('')
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
    },
  })

  /** Load a draft's body back into the compose textarea and switch to the Post tab. */
  const editDraft = (post: Post) => {
    setBody(post.body)
    setScheduleAt('')
    setTab('post')
  }

  const startReschedule = (post: Post) => {
    setRescheduleId(post.id)
    setRescheduleValue(toLocalInput(post.scheduledAt))
  }

  const submitReschedule = (id: string) => {
    if (!isFuture(rescheduleValue)) return
    updatePost.mutate(
      { id, patch: { scheduledAt: new Date(rescheduleValue).toISOString() } },
      { onSuccess: () => setRescheduleId(null) },
    )
  }

  const composeBusy = create.isPending || saveDraft.isPending

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)]">
            <TabsList className="border-b-0">
              <TabsTrigger value="post">Post</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledPosts.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
            </TabsList>

            {tab === 'post' ? (
              <div className="flex items-center gap-1.5">
                <span className="mr-1 hidden text-xs text-[var(--color-muted)] sm:inline">Post on</span>
                {PLATFORMS.slice(0, 3).map((p) => (
                  <PlatformChip
                    key={p.id}
                    label={p.label}
                    icon={p.icon}
                    active={crossPost.includes(p.id)}
                    onClick={() => togglePlatform(p.id)}
                  />
                ))}
                {showAllPlatforms
                  ? PLATFORMS.slice(3).map((p) => (
                      <PlatformChip
                        key={p.id}
                        label={p.label}
                        icon={p.icon}
                        active={crossPost.includes(p.id)}
                        onClick={() => togglePlatform(p.id)}
                      />
                    ))
                  : null}
                <button
                  type="button"
                  onClick={() => setShowAllPlatforms((v) => !v)}
                  aria-pressed={showAllPlatforms}
                  aria-label="More platforms"
                  title="More platforms"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            ) : null}
          </div>

          <TabsContent value="post" className="mt-3 focus-visible:outline-none">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share next big thing..."
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
            />

            {showSchedule && (
              <label className="mt-3 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <CalendarClock className="size-4 shrink-0" />
                <span className="shrink-0">Schedule for later</span>
                <Input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="h-8 max-w-[220px] text-xs"
                />
                {scheduleAt && (
                  <button
                    type="button"
                    onClick={() => setScheduleAt('')}
                    className="text-[var(--color-accent)] hover:opacity-80"
                  >
                    clear
                  </button>
                )}
              </label>
            )}
            {scheduleInvalid && (
              <p className="mt-1 text-xs text-[var(--color-danger,#ef4444)]">Pick a time in the future.</p>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-0.5">
                <ToolbarButton icon={ImageIcon} label="Add image" />
                <ToolbarButton icon={Images} label="Add media" />
                <ToolbarButton icon={Smile} label="Add emoji" />
                <ToolbarButton
                  icon={Calendar}
                  label="Schedule for later"
                  active={showSchedule}
                  onClick={() => setShowSchedule((v) => !v)}
                />
                <ToolbarButton icon={MapPin} label="Add location" />
              </div>
              <div className="flex items-center gap-3">
                {body.trim() ? (
                  <button
                    type="button"
                    disabled={composeBusy}
                    onClick={() => saveDraft.mutate()}
                    className="text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-40"
                  >
                    Save draft
                  </button>
                ) : (
                  <span className="text-sm text-[var(--color-muted)]">Start Writing</span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!body.trim() || composeBusy || scheduleInvalid}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? 'Saving…' : willSchedule ? 'Schedule' : 'Post'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-3 focus-visible:outline-none">
            {scheduled.isLoading ? (
              <p className="py-4 text-center text-xs text-[var(--color-muted)]">Loading…</p>
            ) : scheduledPosts.length === 0 ? (
              <p className="py-4 text-center text-xs text-[var(--color-muted)]">No scheduled posts.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {scheduledPosts.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[var(--color-fg)]">{s.body}</span>
                      <span className="ml-3 shrink-0 text-xs text-[var(--color-muted)]">{countdown(s.scheduledAt)}</span>
                    </div>
                    {rescheduleId === s.id ? (
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="datetime-local"
                          value={rescheduleValue}
                          onChange={(e) => setRescheduleValue(e.target.value)}
                          className="h-8 max-w-[220px] text-xs"
                        />
                        <RowAction
                          onClick={() => submitReschedule(s.id)}
                          disabled={!isFuture(rescheduleValue) || updatePost.isPending}
                        >
                          Save
                        </RowAction>
                        <RowAction onClick={() => setRescheduleId(null)}>Cancel</RowAction>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-3">
                        <RowAction onClick={() => startReschedule(s)}>Reschedule</RowAction>
                        <RowAction onClick={() => publishNow.mutate(s.id)} disabled={publishNow.isPending}>
                          Publish now
                        </RowAction>
                        <RowAction
                          onClick={() => updatePost.mutate({ id: s.id, patch: { status: 'draft', scheduledAt: undefined } })}
                          disabled={updatePost.isPending}
                          danger
                        >
                          Cancel
                        </RowAction>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-3 focus-visible:outline-none">
            {drafts.isLoading ? (
              <p className="py-4 text-center text-xs text-[var(--color-muted)]">Loading…</p>
            ) : draftPosts.length === 0 ? (
              <p className="py-4 text-center text-xs text-[var(--color-muted)]">No drafts.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {draftPosts.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[var(--color-fg)]">{d.body}</span>
                      <span className="ml-3 shrink-0 text-xs text-[var(--color-muted)]">{timeAgo(d.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <RowAction onClick={() => editDraft(d)}>Edit</RowAction>
                      <RowAction onClick={() => publishNow.mutate(d.id)} disabled={publishNow.isPending}>
                        Publish
                      </RowAction>
                      <RowAction
                        onClick={() => updatePost.mutate({ id: d.id, patch: { status: 'scheduled', scheduledAt: new Date(Date.now() + 3_600_000).toISOString() } })}
                        disabled={updatePost.isPending}
                      >
                        Schedule
                      </RowAction>
                      <RowAction onClick={() => deletePost.mutate(d.id)} disabled={deletePost.isPending} danger>
                        Delete
                      </RowAction>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
