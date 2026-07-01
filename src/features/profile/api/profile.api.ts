/**
 * Profile data access. Branches on env.useMocks: returns local mocks for web2
 * dev, otherwise hits the backend via the shared apiClient. Endpoint paths
 * track docs/06-profile/profile-api-contract.md.
 */
import { apiClient } from '@/shared/api/client'
import { env } from '@/config/env'
import { getCurrentUserId } from '../lib/current-user'
import {
  MOCK_CURRENT_USER_ID,
  mockActivity,
  mockClubs,
  mockFollowers,
  mockFollowing,
  mockHolders,
  mockHolding,
  mockProfilesByHandle,
  mockSelfProfile,
} from '../mocks'
import type {
  ActivityDto,
  ClubCardDto,
  ProfileDto,
  UpdateProfileInput,
  UserCardDto,
} from '../types'

/** Simulate network latency so loading states are exercised in mock mode. */
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

/** A cursor-paginated list envelope as returned by the backend. */
interface Page<T> {
  items: T[]
  meta?: unknown
  next_cursor?: string | null
}

/** Local, mutable copy of the mock profile so follow/unfollow can persist. */
const mockState: { profilesByHandle: Record<string, ProfileDto> } = {
  profilesByHandle: { ...mockProfilesByHandle },
}

/**
 * GET /users/:handle — resolve a profile by @handle (or #userId/uuid).
 * In mock mode, unknown handles fall back to the "other" template so the
 * screen still renders.
 */
export async function getProfile(handle: string): Promise<ProfileDto> {
  if (env.useMocks) {
    await delay()
    const key = handle.replace(/^[@#]/, '')
    const found = mockState.profilesByHandle[key]
    if (found) return { ...found }
    // Unknown handle: synthesize an "other" profile from the template.
    const template = mockState.profilesByHandle.satoshi
    return { ...template, handle: key, displayName: key, id: `u_${key}` }
  }
  return apiClient.get(`/users/${handle}`) as unknown as Promise<ProfileDto>
}

/** PATCH /users/me — owner-only profile edit. */
export async function updateMe(input: UpdateProfileInput): Promise<ProfileDto> {
  if (env.useMocks) {
    await delay(300)
    const next: ProfileDto = { ...mockSelfProfile, ...input }
    // Persist to the mock store so refetch surfaces the edit.
    mockState.profilesByHandle[next.handle] = next
    mockState.profilesByHandle[MOCK_CURRENT_USER_ID] = next
    return { ...next }
  }
  return apiClient.patch('/users/me', input) as unknown as Promise<ProfileDto>
}

/** POST /users/:id/follow — idempotent, JWT required (409 on self-follow). */
export async function follow(id: string): Promise<{ following: true }> {
  if (env.useMocks) {
    await delay(150)
    return { following: true }
  }
  return apiClient.post(`/users/${id}/follow`) as unknown as Promise<{ following: true }>
}

/** DELETE /users/:id/follow. */
export async function unfollow(id: string): Promise<{ following: false }> {
  if (env.useMocks) {
    await delay(150)
    return { following: false }
  }
  return apiClient.delete(`/users/${id}/follow`) as unknown as Promise<{ following: false }>
}

/** GET /users/:id/followers */
export async function getFollowers(id: string): Promise<UserCardDto[]> {
  if (env.useMocks) {
    await delay()
    return [...mockFollowers]
  }
  const page = (await apiClient.get(`/users/${id}/followers`)) as unknown as Page<UserCardDto>
  return page.items
}

/** GET /users/:id/following */
export async function getFollowing(id: string): Promise<UserCardDto[]> {
  if (env.useMocks) {
    await delay()
    return [...mockFollowing]
  }
  const page = (await apiClient.get(`/users/${id}/following`)) as unknown as Page<UserCardDto>
  return page.items
}

/** GET /users/:id/clubs — clubs the user created. */
export async function getClubs(id: string): Promise<ClubCardDto[]> {
  if (env.useMocks) {
    await delay()
    return [...mockClubs]
  }
  return apiClient.get(`/users/${id}/clubs`) as unknown as Promise<ClubCardDto[]>
}

/** GET /users/:id/holding — clubs the user holds keys in. */
export async function getHolding(id: string): Promise<ClubCardDto[]> {
  if (env.useMocks) {
    await delay()
    return [...mockHolding]
  }
  return apiClient.get(`/users/${id}/holding`) as unknown as Promise<ClubCardDto[]>
}

/** GET /users/:id/holders — who holds this user's key. */
export async function getHolders(id: string): Promise<UserCardDto[]> {
  if (env.useMocks) {
    await delay()
    return [...mockHolders]
  }
  return apiClient.get(`/users/${id}/holders`) as unknown as Promise<UserCardDto[]>
}

/** GET /users/:id/activity — trades + posts + governance feed. */
export async function getActivity(id: string): Promise<ActivityDto[]> {
  if (env.useMocks) {
    await delay()
    return [...mockActivity]
  }
  const page = (await apiClient.get(`/users/${id}/activity`)) as unknown as Page<ActivityDto>
  return page.items
}

/** Whether the given profile belongs to the signed-in viewer. */
export function isOwnProfile(profile: ProfileDto): boolean {
  return profile.viewerRelation === 'self' || profile.id === getCurrentUserId()
}
