'use client'

import {
  ArrowLeft,
  Camera,
  KeyRound,
  MessageCircle,
  Pencil,
  Share2,
  ShoppingCart,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/shared/lib/format'
import { useFollowMutation, useProfile } from '../hooks/use-profile'
import type { ProfileDto, ProfileTab } from '../types'
import { EditProfileModal } from './edit-profile-modal'
import { ProfileHeader } from './profile-header'
import { ProfileTabs } from './profile-tabs'
import { StatTiles } from './stat-tiles'

/** Bordered "You own" · "Key Price" box shown in the header's top-right cluster. */
function MetricBox({ profile }: { profile: ProfileDto }) {
  return (
    <div className="flex divide-x divide-[var(--color-border)] rounded-[var(--radius)] border border-[var(--color-border)]">
      <div className="px-4 py-2 text-center">
        <div className="flex items-center justify-center gap-1 text-[var(--color-fg)]">
          <KeyRound className="size-3.5 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold">{formatNumber(profile.ownKeyCount ?? 0)}</span>
        </div>
        <p className="text-xs text-[var(--color-muted)]">You own</p>
      </div>
      <div className="px-4 py-2 text-center">
        <div className="flex items-center justify-center gap-1 text-[var(--color-fg)]">
          <span className="size-2 rounded-full bg-[var(--color-positive)]" />
          <span className="text-sm font-semibold">{profile.keyPrice ?? '—'}</span>
        </div>
        <p className="text-xs text-[var(--color-muted)]">Key Price</p>
      </div>
    </div>
  )
}

/** Edit/Buy (self) or Follow/Chat/Buy (other) buttons for the header cluster. */
function ProfileActions({ profile, onEdit }: { profile: ProfileDto; onEdit: () => void }) {
  const router = useRouter()
  const followMutation = useFollowMutation(profile.handle)
  const isSelf = profile.viewerRelation === 'self'
  const isFollowing = profile.viewerRelation === 'following'

  const onBuy = () => console.log('[profile] buy key ->', profile.id) // TODO: Trade Keys modal
  const onChat = () => router.push('/chat')
  const onToggleFollow = () => followMutation.mutate({ id: profile.id, next: !isFollowing })

  return (
    <div className="flex flex-wrap gap-2">
      {isSelf ? (
        <>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <Button variant="primary" size="sm" onClick={onBuy}>
            <KeyRound />
            Buy
          </Button>
        </>
      ) : (
        <>
          <Button
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            onClick={onToggleFollow}
            disabled={followMutation.isPending}
          >
            {isFollowing ? <UserMinus /> : <UserPlus />}
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          <Button variant="secondary" size="sm" onClick={onChat}>
            <MessageCircle />
            Chat
          </Button>
          <Button variant="primary" size="sm" onClick={onBuy}>
            <ShoppingCart />
            Buy
          </Button>
        </>
      )}
    </div>
  )
}

/** "Share" · "Snapshot Holders" text links shown under the bio. */
function ProfileLinks({ profile }: { profile: ProfileDto }) {
  const onShare = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`
    // TODO: use the Web Share API / toast; stubbed for now.
    console.log('[profile] share ->', url)
  }
  const onSnapshot = () => console.log('[profile] snapshot holders ->', profile.id) // TODO: export dialog

  return (
    <>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:opacity-80"
      >
        <Share2 className="size-4" />
        Share
      </button>
      <button
        type="button"
        onClick={onSnapshot}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:opacity-80"
      >
        <Camera className="size-4" />
        Snapshot Holders
      </button>
    </>
  )
}

/**
 * User Profile screen. Renders a back arrow + header (identity, action buttons
 * and the You own/Key Price box) + stat tiles + the profile tabs. Action set
 * varies by viewerRelation; works in mock mode with no backend.
 */
export function ProfileScreen({ handle }: { handle: string }) {
  const router = useRouter()
  const { data: profile, isLoading, isError } = useProfile(handle)
  const [tab, setTab] = useState<ProfileTab>('clubs')
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex size-8 items-center justify-center rounded-[var(--radius)] text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          <ArrowLeft className="size-5" />
        </button>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">Loading profile…</p>
        ) : isError || !profile ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">Profile not found.</p>
        ) : (
          <>
            <ProfileHeader
              profile={profile}
              actions={
                <>
                  <ProfileActions profile={profile} onEdit={() => setEditOpen(true)} />
                  <MetricBox profile={profile} />
                </>
              }
              links={<ProfileLinks profile={profile} />}
            />
            <StatTiles stats={profile.stats} onSelect={setTab} />
            <ProfileTabs profile={profile} value={tab} onValueChange={setTab} />

            {profile.viewerRelation === 'self' ? (
              <EditProfileModal
                profile={profile}
                open={editOpen}
                onClose={() => setEditOpen(false)}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
