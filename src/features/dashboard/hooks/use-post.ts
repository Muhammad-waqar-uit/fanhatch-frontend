'use client'

import { useQuery } from '@tanstack/react-query'
import { getPost } from '../api/dashboard.api'

/** Fetch a single post by id for the detail view. */
export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: Boolean(id),
  })
}
