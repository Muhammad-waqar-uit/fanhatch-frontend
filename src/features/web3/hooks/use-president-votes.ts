'use client'

import { useQuery } from '@tanstack/react-query'
import { web3Config } from '../config'
import { presidentVotes, type Amount } from '../reads'

/** Votes cast for `candidate` in `clubId`'s presidential race. Disabled when web3 is off. */
export function usePresidentVotes(clubId?: bigint, candidate?: string) {
  const enabled = web3Config.enabled && clubId !== undefined && Boolean(candidate)
  return useQuery<Amount>({
    queryKey: ['web3', 'presidentVotes', clubId?.toString(), candidate],
    enabled,
    queryFn: () => presidentVotes(clubId!, candidate!),
  })
}
