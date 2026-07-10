'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getActivity,
  getClubs,
  getFollowers,
  getFollowing,
  getHolders,
  getHolding,
  getUserLikes,
  getUserPosts,
  getUserReplies,
} from '../api/profile.api'
import { profileKeys } from './use-profile'

/** Per-tab data hooks. Keyed by owner id so they refetch when the profile changes. */

export function useFollowers(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.followers(id),
    queryFn: () => getFollowers(id),
    enabled: enabled && Boolean(id),
  })
}

export function useFollowing(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.following(id),
    queryFn: () => getFollowing(id),
    enabled: enabled && Boolean(id),
  })
}

export function useClubs(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.clubs(id),
    queryFn: () => getClubs(id),
    enabled: enabled && Boolean(id),
  })
}

export function useHolding(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.holding(id),
    queryFn: () => getHolding(id),
    enabled: enabled && Boolean(id),
  })
}

export function useHolders(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.holders(id),
    queryFn: () => getHolders(id),
    enabled: enabled && Boolean(id),
  })
}

export function useActivity(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.activity(id),
    queryFn: () => getActivity(id),
    enabled: enabled && Boolean(id),
  })
}

export function useUserPosts(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.posts(id),
    queryFn: () => getUserPosts(id),
    enabled: enabled && Boolean(id),
  })
}

export function useUserReplies(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.replies(id),
    queryFn: () => getUserReplies(id),
    enabled: enabled && Boolean(id),
  })
}

export function useUserLikes(id: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.likes(id),
    queryFn: () => getUserLikes(id),
    enabled: enabled && Boolean(id),
  })
}
