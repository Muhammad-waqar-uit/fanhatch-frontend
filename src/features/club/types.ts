/** Domain types for the Club Profile feature — aligned with the backend ClubDto. */

export interface ClubCreator {
  id: string
  handle: string
  name: string
}

/** A club (GET /clubs/:id). */
export interface Club {
  id: string
  clubId: number
  ftId: string
  name: string
  ticker: string
  description?: string
  avatarUrl?: string
  curveType: string
  creator: ClubCreator
  socials?: { x?: string; email?: string; website?: string }
  supply: number
  keyPrice: string
  memberCount: number
  chatRoomId?: string
  created: string
}

/** A candidate's standing in the president vote (GET /clubs/:id/president). */
export interface ClubStanding {
  candidate: { id: string; name: string; handle?: string; avatarUrl?: string }
  votes: number
}

export interface ClubPresidentState {
  president: { id?: string; name: string; handle?: string } | null
  standings: ClubStanding[]
}
