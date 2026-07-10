'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReply, getReplies } from '../api/dashboard.api'

/** List a post's replies (oldest-first). */
export function useReplies(id: string) {
  return useQuery({
    queryKey: ['replies', id],
    queryFn: () => getReplies(id),
    enabled: Boolean(id),
  })
}

/**
 * Reply to a post via POST /posts { body, parentId }. On success, refresh the
 * reply thread and the parent post (its comment count changed) plus the feed.
 */
export function useCreateReply(parentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => createReply(parentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', parentId] })
      queryClient.invalidateQueries({ queryKey: ['post', parentId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
