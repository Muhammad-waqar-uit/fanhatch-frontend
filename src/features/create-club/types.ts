/** Domain types for the Create Club feature. */

/**
 * Bonding-curve preset. Figma shows three options:
 * casual (gentle), standard (medium), exclusive (steep).
 */
export type CurveType = 'casual' | 'standard' | 'exclusive'

/** Optional social links surfaced on a club's token page. */
export interface ClubSocials {
  x?: string
  email?: string
  website?: string
}

/** A club as returned by the backend (mirrors the contract's ClubDto). */
export interface ClubDto {
  id: string
  clubId: number
  ftId: string
  name: string
  ticker: string
  description?: string
  avatarUrl?: string
  curveType: CurveType
  creator: { id: string; handle: string; name: string }
  socials?: ClubSocials
  supply: number
  keyPrice: string
  memberCount: number
  chatRoomId?: string
  created: string
}

/** Payload for POST /clubs. */
export interface CreateClubInput {
  name: string
  ticker: string
  description?: string
  avatarUrl?: string
  curveType: CurveType
  socials?: ClubSocials
  /** Keys the creator buys on create (first key is free). */
  firstKeyQty?: number
}

/** Metadata describing a selectable curve preset in the picker. */
export interface CurvePreset {
  type: CurveType
  label: string
  /** One-line description of the trading behaviour. */
  blurb: string
  /** Stroke colour for the preview + selected state (CSS colour). */
  color: string
}
