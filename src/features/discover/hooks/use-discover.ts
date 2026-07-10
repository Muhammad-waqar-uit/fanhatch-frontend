'use client'

import { useQuery } from '@tanstack/react-query'
import { getCreators, getTrendingClubs, searchDiscover } from '../api/discover.api'

/** Trending clubs for the Discover grid. */
export function useTrendingClubs() {
  return useQuery({ queryKey: ['discover', 'trending'], queryFn: () => getTrendingClubs() })
}

/** Suggested creators for the Discover list. */
export function useCreators() {
  return useQuery({ queryKey: ['discover', 'creators'], queryFn: () => getCreators() })
}

/** Grouped search (clubs + creators). Only runs when `q` is non-empty. */
export function useDiscoverSearch(q: string) {
  const query = q.trim()
  return useQuery({
    queryKey: ['discover', 'search', query],
    queryFn: () => searchDiscover(query),
    enabled: query.length > 0,
  })
}
