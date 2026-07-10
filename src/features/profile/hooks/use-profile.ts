'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { follow, getProfile, unfollow, updateMe } from '../api/profile.api'
import type { ProfileDto, UpdateProfileInput } from '../types'

export const profileKeys = {
  profile: (handle: string) => ['profile', handle] as const,
  followers: (id: string) => ['profile', id, 'followers'] as const,
  following: (id: string) => ['profile', id, 'following'] as const,
  clubs: (id: string) => ['profile', id, 'clubs'] as const,
  holding: (id: string) => ['profile', id, 'holding'] as const,
  holders: (id: string) => ['profile', id, 'holders'] as const,
  activity: (id: string) => ['profile', id, 'activity'] as const,
  posts: (id: string) => ['profile', id, 'posts'] as const,
  replies: (id: string) => ['profile', id, 'replies'] as const,
  likes: (id: string) => ['profile', id, 'likes'] as const,
}

/** Load a profile by @handle. */
export function useProfile(handle: string) {
  return useQuery({
    queryKey: profileKeys.profile(handle),
    queryFn: () => getProfile(handle),
    enabled: Boolean(handle),
  })
}

/**
 * Optimistic follow / unfollow. Flips `viewerRelation` and the follower count
 * in the cache immediately, rolls back on error, and invalidates on settle.
 */
export function useFollowMutation(handle: string) {
  const qc = useQueryClient()
  const key = profileKeys.profile(handle)

  return useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }): Promise<{ following: boolean }> =>
      next ? follow(id) : unfollow(id),
    onMutate: async ({ next }) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<ProfileDto>(key)
      if (previous) {
        qc.setQueryData<ProfileDto>(key, {
          ...previous,
          viewerRelation: next ? 'following' : 'other',
          stats: {
            ...previous.stats,
            followers: Math.max(0, previous.stats.followers + (next ? 1 : -1)),
          },
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key })
    },
  })
}

/** Owner-only profile edit; refreshes the cached profile on success. */
export function useUpdateProfile(handle: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMe(input),
    onSuccess: (updated) => {
      qc.setQueryData(profileKeys.profile(handle), updated)
      qc.invalidateQueries({ queryKey: profileKeys.profile(handle) })
    },
  })
}
