'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePost } from '../hooks/use-post'
import { useCreateReply, useReplies } from '../hooks/use-replies'
import { PostCard } from './post-card'

function DetailSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-[var(--color-surface-2)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[var(--color-surface-2)]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/** Composer for a reply under the current post. */
function ReplyComposer({ parentId }: { parentId: string }) {
  const [body, setBody] = useState('')
  const create = useCreateReply(parentId)

  const submit = () => {
    const text = body.trim()
    if (!text) return
    create.mutate(text, { onSuccess: () => setBody('') })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Post your reply…"
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
        />
        <div className="mt-2 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            disabled={!body.trim() || create.isPending}
            onClick={submit}
          >
            {create.isPending ? 'Replying…' : 'Reply'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/** Focused thread view: the post, a reply composer, and its replies. */
export function PostDetail({ id }: { id: string }) {
  const { data: post, isLoading, isError } = usePost(id)
  const replies = useReplies(id)
  const replyList = replies.data ?? []

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-[600px] min-w-0 flex-col gap-4 px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError || !post ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-[var(--color-muted)]">
              This post is no longer available.
            </CardContent>
          </Card>
        ) : (
          <>
            <PostCard post={post} detail />

            <ReplyComposer parentId={id} />

            <div className="flex flex-col gap-3">
              {replies.isLoading ? (
                <DetailSkeleton />
              ) : replyList.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-[var(--color-muted)]">
                    No replies yet.
                  </CardContent>
                </Card>
              ) : (
                replyList.map((reply) => (
                  // Indent child replies to visualise the thread; each is itself openable.
                  <div key={reply.id} className="border-l-2 border-[var(--color-border)] pl-3">
                    <PostCard post={reply} />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
