'use client'

import { useQuery } from '@tanstack/react-query'
import { getBookmarks } from '../api/bookmarks.api'

export const bookmarkKeys = {
  list: () => ['bookmarks'] as const,
}

/** Load the signed-in user's bookmarked posts. */
export function useBookmarks() {
  return useQuery({
    queryKey: bookmarkKeys.list(),
    queryFn: () => getBookmarks(),
  })
}
