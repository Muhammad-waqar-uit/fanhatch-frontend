'use client'

import { useQuery } from '@tanstack/react-query'
import { getMyPosts } from '../api/dashboard.api'
import type { PostStatus } from '../types'

/** List the current user's posts for a given status (scheduled / draft / published). */
export function useMyPosts(status: PostStatus) {
  return useQuery({
    queryKey: ['myPosts', status],
    queryFn: () => getMyPosts(status),
  })
}
