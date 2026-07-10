/** Mock club data for dev (env.useMocks). */
import type { Club, ClubPresidentState } from './types'

export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const MOCK_CLUB: Club = {
  id: 'mock-club-1',
  clubId: 12345,
  ftId: 'FT#12345',
  name: 'Ethel Club',
  ticker: 'ETHEL',
  description: 'Lorem ipsum dolor sit amet consectetur. Enim tellus proin vitae condimentum.',
  curveType: 'standard',
  creator: { id: 'u-creator', handle: 'handle', name: 'Creator' },
  supply: 100,
  keyPrice: '0.09000000',
  memberCount: 100,
  created: '2025-12-01T00:00:00.000Z',
}

export const MOCK_PRESIDENT: ClubPresidentState = {
  president: { id: 'u1', name: 'Username', handle: '@handle' },
  standings: [
    { candidate: { id: 'u1', name: 'Username', handle: '@handle' }, votes: 10 },
    { candidate: { id: 'u2', name: 'Username', handle: '@handle' }, votes: 8 },
    { candidate: { id: 'u3', name: 'Username', handle: '@handle' }, votes: 5 },
  ],
}
