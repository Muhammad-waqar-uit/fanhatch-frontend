/**
 * Discover data access. Branches on env.useMocks: returns local mocks in mock
 * mode, else hits the real /discover/* endpoints (apiClient unwraps the
 * `{success,data}` envelope). The backend has no price history, so club
 * sparklines are synthesized deterministically from price + change.
 */
import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'
import { SUGGESTED_CREATORS, TRENDING_CLUBS, spark } from '../mocks'
import type { DiscoverClub, DiscoverCreator } from '../types'

interface ApiClub {
  id: string
  clubId: number
  name: string
  ticker: string
  ftId: string
  keyPrice: string
  memberCount: number
  changePct: number
}

interface ApiCreator {
  id: string
  name: string
  handle: string
  avatarUrl?: string
  bio?: string
  followers: number
}

function mapClub(c: ApiClub): DiscoverClub {
  const priceEth = Number(c.keyPrice) || 0
  const changePct = c.changePct ?? 0
  return {
    id: c.id,
    name: c.name,
    ticker: c.ticker,
    clubNo: c.clubId,
    priceEth,
    changePct,
    holders: c.memberCount ?? 0,
    history: spark(priceEth || 0.01, changePct, c.clubId),
  }
}

function mapCreator(c: ApiCreator): DiscoverCreator {
  return {
    id: c.id,
    name: c.name,
    handle: c.handle,
    avatarUrl: c.avatarUrl,
    bio: c.bio ?? '',
    followers: c.followers ?? 0,
  }
}

export async function getTrendingClubs(limit = 12): Promise<DiscoverClub[]> {
  if (env.useMocks) return TRENDING_CLUBS
  const raw = (await apiClient.get('/discover/trending-clubs', {
    params: { limit },
  })) as unknown as ApiClub[]
  return (raw ?? []).map(mapClub)
}

export async function getCreators(limit = 10): Promise<DiscoverCreator[]> {
  if (env.useMocks) return SUGGESTED_CREATORS
  const raw = (await apiClient.get('/discover/creators', {
    params: { limit },
  })) as unknown as ApiCreator[]
  return (raw ?? []).map(mapCreator)
}

export interface DiscoverSearchResult {
  clubs: DiscoverClub[]
  creators: DiscoverCreator[]
}

export async function searchDiscover(q: string): Promise<DiscoverSearchResult> {
  const query = q.trim()
  if (!query) return { clubs: [], creators: [] }
  if (env.useMocks) {
    const ql = query.toLowerCase()
    return {
      clubs: TRENDING_CLUBS.filter(
        (c) => c.name.toLowerCase().includes(ql) || c.ticker.toLowerCase().includes(ql),
      ),
      creators: SUGGESTED_CREATORS.filter(
        (c) => c.name.toLowerCase().includes(ql) || c.handle.toLowerCase().includes(ql),
      ),
    }
  }
  const raw = (await apiClient.get('/discover/search', {
    params: { q: query },
  })) as unknown as { clubs: ApiClub[]; creators: ApiCreator[] }
  return {
    clubs: (raw?.clubs ?? []).map(mapClub),
    creators: (raw?.creators ?? []).map(mapCreator),
  }
}
