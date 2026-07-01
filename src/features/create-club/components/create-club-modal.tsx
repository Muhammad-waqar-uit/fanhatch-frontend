'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClub } from '../api/create-club.api'
import type { ClubDto, CreateClubInput } from '../types'
import { ClubForm } from './club-form'

type Step = 'intro' | 'form'

/** The "Introducing Clubs" primer shown before the form. */
function IntroStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[var(--color-fg)]">Introducing Clubs</h1>
      <ul className="flex flex-col gap-3 text-sm text-[var(--color-muted)]">
        <li>
          Clubs are private spaces owned and moderated by keyholders — buy a key to get in.
        </li>
        <li>Keyholders vote to elect a president who moderates the club.</li>
        <li>
          Club keys are transacted in <span className="text-[var(--color-fg)]">$FANS</span>, with a
          1.5% fee split between farmers and Fans.tech.
        </li>
        <li>
          Clubs can share names, so always check the unique{' '}
          <span className="text-[var(--color-fg)]">FT#</span> before trading.
        </li>
      </ul>
      <Button size="lg" onClick={onContinue}>
        Got it
      </Button>
    </div>
  )
}

export interface CreateClubScreenProps {
  /** Called after a successful create (defaults to routing home). */
  onCreated?: (club: ClubDto) => void
}

/**
 * Orchestrates the create-club flow: intro → form → POST /clubs. On success it
 * routes to home (or the caller's `onCreated`) and logs the new club's ftId.
 * Works with no backend via env.useMocks in the api layer.
 */
export function CreateClubScreen({ onCreated }: CreateClubScreenProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')

  const mutation = useMutation({
    mutationFn: (input: CreateClubInput) => createClub(input),
    onSuccess: (club) => {
      console.log('[create-club] created', club.ftId, club)
      if (onCreated) onCreated(club)
      else router.push('/')
    },
  })

  const errorMessage = mutation.isError
    ? 'Could not create your club. Please try again.'
    : null

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        {step === 'intro' ? (
          <IntroStep onContinue={() => setStep('form')} />
        ) : (
          <ClubForm
            submitting={mutation.isPending}
            error={errorMessage}
            onSubmit={(input) => mutation.mutate(input)}
          />
        )}
      </div>
    </div>
  )
}
