'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buyClubKey, getClub, getClubPresident } from '../api/club.api'

export function useClub(id: string) {
  return useQuery({ queryKey: ['club', id], queryFn: () => getClub(id), enabled: id.length > 0 })
}

export function useClubPresident(id: string) {
  return useQuery({
    queryKey: ['club', id, 'president'],
    queryFn: () => getClubPresident(id),
    enabled: id.length > 0,
  })
}

export function useBuyClubKey(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => buyClubKey(id, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['club', id] }),
  })
}
