'use client'

import { useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
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
    <div className="flex flex-col gap-5">
      {/* Hero banner (illustration placeholder). */}
      <div
        className="h-40 w-full rounded-[var(--radius)] bg-gradient-to-br from-[var(--color-accent)]/30 via-[var(--color-surface-2)] to-[var(--color-surface)]"
        aria-hidden
      />
      <h1 className="text-center text-xl font-semibold text-[var(--color-fg)]">Introducing Clubs</h1>
      <div className="flex flex-col gap-4 text-sm text-[var(--color-muted)]">
        <p>Clubs are private spaces owned and moderated by keyholders.</p>
        <p>Keyholders vote for the club president, who manages the club and chooses moderators.</p>
        <p>
          Club keys are transacted in <span className="text-[var(--color-accent)]">$FANS</span>. Each
          transaction has 1.5% fees that are distributed to farmers and Fans.tech.
        </p>
        <p>
          Clubs can have the same name, so make sure to always check for its unique{' '}
          <span className="text-[var(--color-fg)]">FT#</span>
        </p>
      </div>
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--color-fg)]">Create Club</h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => router.push('/')}
          >
            <X />
          </Button>
        </div>
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
