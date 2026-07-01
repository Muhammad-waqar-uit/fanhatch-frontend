'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Globe, Hash, Instagram, Linkedin, Twitter } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/lib/cn'
import { timeAgo } from '@/shared/lib/format'
import { createPost } from '../api/dashboard.api'
import { mockDrafts, mockScheduled } from '../mocks'

const PLATFORMS = [
  { id: 'x', label: 'X', icon: Twitter },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'farcaster', label: 'Farcaster', icon: Hash },
  { id: 'lens', label: 'Lens', icon: Globe },
] as const

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
        'inline-flex size-8 items-center justify-center rounded-full border transition-colors',
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]',
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

export function Composer() {
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [crossPost, setCrossPost] = useState<string[]>([])

  const togglePlatform = (id: string) =>
    setCrossPost((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const mutation = useMutation({
    mutationFn: () => createPost({ body, crossPostTo: crossPost }),
    onSuccess: () => {
      setBody('')
      setCrossPost([])
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="post">
          <TabsList className="w-full">
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({mockScheduled.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({mockDrafts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="mt-3 focus-visible:outline-none">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="share next big thing…"
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {PLATFORMS.map((p) => (
                  <PlatformChip
                    key={p.id}
                    label={p.label}
                    icon={p.icon}
                    active={crossPost.includes(p.id)}
                    onClick={() => togglePlatform(p.id)}
                  />
                ))}
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={!body.trim() || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-3 focus-visible:outline-none">
            <ul className="flex flex-col gap-2">
              {mockScheduled.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
                >
                  <span className="truncate text-[var(--color-fg)]">{s.body}</span>
                  <span className="ml-3 shrink-0 text-xs text-[var(--color-muted)]">
                    {new Date(s.scheduledFor).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="drafts" className="mt-3 focus-visible:outline-none">
            <ul className="flex flex-col gap-2">
              {mockDrafts.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
                >
                  <span className="truncate text-[var(--color-fg)]">{d.body}</span>
                  <span className="ml-3 shrink-0 text-xs text-[var(--color-muted)]">{timeAgo(d.updatedAt)}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
