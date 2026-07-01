'use client'

import { useQuery } from '@tanstack/react-query'
import { getTrending } from '../api/dashboard.api'

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
  })
}
