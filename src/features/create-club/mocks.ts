/** Mock data for Create Club (served when env.useMocks is true). */
import type { ClubDto, CreateClubInput, CurvePreset } from './types'

/** The three curve presets rendered by the picker (figma: 3 options). */
export const CURVE_PRESETS: CurvePreset[] = [
  {
    type: 'casual',
    label: 'Casual',
    blurb: 'Gentle climb — friendliest for new holders.',
    color: 'var(--color-positive)',
  },
  {
    type: 'standard',
    label: 'Standard',
    blurb: 'Balanced growth as your club grows.',
    color: '#a855f7',
  },
  {
    type: 'exclusive',
    label: 'Exclusive',
    blurb: 'Steep curve — rewards the earliest holders.',
    color: '#f59e0b',
  },
]

let mockClubSeq = 42

/** Build a fake ClubDto from a create payload so the flow works with no backend. */
export function makeMockClub(input: CreateClubInput): ClubDto {
  const clubId = mockClubSeq++
  const qty = Math.max(1, input.firstKeyQty ?? 1)
  return {
    id: `club-${crypto.randomUUID()}`,
    clubId,
    ftId: `FT${clubId}`,
    name: input.name,
    ticker: input.ticker,
    description: input.description,
    avatarUrl: input.avatarUrl,
    curveType: input.curveType,
    creator: { id: 'me', handle: 'you', name: 'You' },
    socials: input.socials,
    // First key is free; creator starts holding `qty` keys.
    supply: qty,
    keyPrice: '0.01',
    memberCount: 1,
    chatRoomId: `room-${clubId}`,
    created: new Date().toISOString(),
  }
}
