'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateProfile } from '../hooks/use-profile'
import type { ProfileDto } from '../types'

/**
 * Owner-only edit modal for display name, bio, avatar URL and socials.
 * Lightweight overlay (no radix dialog dependency in the project yet).
 */
export function EditProfileModal({
  profile,
  open,
  onClose,
}: {
  profile: ProfileDto
  open: boolean
  onClose: () => void
}) {
  const update = useUpdateProfile(profile.handle)
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '')
  const [x, setX] = useState(profile.socials?.x ?? '')
  const [farcaster, setFarcaster] = useState(profile.socials?.farcaster ?? '')

  // Reset local form state whenever the modal (re)opens.
  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName)
      setBio(profile.bio ?? '')
      setAvatarUrl(profile.avatarUrl ?? '')
      setX(profile.socials?.x ?? '')
      setFarcaster(profile.socials?.farcaster ?? '')
    }
  }, [open, profile])

  if (!open) return null

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        socials: { x: x.trim() || undefined, farcaster: farcaster.trim() || undefined },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-fg)]">Edit profile</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">Display name</span>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full resize-none rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">Avatar URL</span>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-muted)]">X</span>
              <Input value={x} onChange={(e) => setX(e.target.value)} placeholder="handle" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-muted)]">Farcaster</span>
              <Input value={farcaster} onChange={(e) => setFarcaster(e.target.value)} placeholder="handle" />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending || !displayName.trim()}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}
