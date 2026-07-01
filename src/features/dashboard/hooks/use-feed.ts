'use client'

import { useQuery } from '@tanstack/react-query'
import { getFeed } from '../api/dashboard.api'
import type { FeedFilter } from '../types'

export function useFeed(filter: FeedFilter = 'all') {
  return useQuery({
    queryKey: ['feed', filter],
    queryFn: () => getFeed(filter),
  })
}
