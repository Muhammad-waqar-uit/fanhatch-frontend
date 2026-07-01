'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost, publishNow, updatePost } from '../api/dashboard.api'
import type { UpdatePostInput } from '../types'

/**
 * Invalidate every `['myPosts', *]` list plus the feed. Status transitions (e.g.
 * cancel = scheduled→draft, publish = →feed) move items between lists, so we
 * refresh all of them rather than a single status.
 */
function useInvalidatePosts() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['myPosts'] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }
}

/** Edit / reschedule / cancel a post via PATCH /posts/:id. */
export function useUpdatePost() {
  const invalidate = useInvalidatePosts()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePostInput }) => updatePost(id, patch),
    onSuccess: invalidate,
  })
}

/** Delete a post via DELETE /posts/:id. */
export function useDeletePost() {
  const invalidate = useInvalidatePosts()
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: invalidate,
  })
}

/** Force-publish a scheduled/draft post now via POST /posts/:id/publish. */
export function usePublishNow() {
  const invalidate = useInvalidatePosts()
  return useMutation({
    mutationFn: (id: string) => publishNow(id),
    onSuccess: invalidate,
  })
}
