'use client'

import { Camera, MessageCircle, Pencil, Share2, ShoppingCart, UserMinus, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/shared/lib/format'
import { useFollowMutation, useProfile } from '../hooks/use-profile'
import type { ProfileDto, ProfileTab } from '../types'
import { EditProfileModal } from './edit-profile-modal'
import { ProfileHeader } from './profile-header'
import { ProfileTabs } from './profile-tabs'
import { StatTiles } from './stat-tiles'

/** "You own" + "Key Price" metric tiles. */
function MetricTiles({ profile }: { profile: ProfileDto }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="px-3 py-2">
        <p className="text-base font-semibold text-[var(--color-fg)]">
          {formatNumber(profile.ownKeyCount ?? 0)}
        </p>
        <p className="text-xs text-[var(--color-muted)]">You own</p>
      </Card>
      <Card className="px-3 py-2">
        <p className="text-base font-semibold text-[var(--color-fg)]">{profile.keyPrice ?? '—'}</p>
        <p className="text-xs text-[var(--color-muted)]">Key Price</p>
      </Card>
    </div>
  )
}

/** Action buttons vary by viewerRelation (self vs other); Share + Snapshot for all. */
function ProfileActions({
  profile,
  onEdit,
}: {
  profile: ProfileDto
  onEdit: () => void
}) {
  const router = useRouter()
  const followMutation = useFollowMutation(profile.handle)
  const isSelf = profile.viewerRelation === 'self'
  const isFollowing = profile.viewerRelation === 'following'

  const onShare = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`
    // TODO: use the Web Share API / toast; stubbed for now.
    console.log('[profile] share ->', url)
  }
  const onBuy = () => console.log('[profile] buy key ->', profile.id) // TODO: Trade Keys modal
  const onSnapshot = () => console.log('[profile] snapshot holders ->', profile.id) // TODO: export dialog
  const onChat = () => router.push('/chat')
  const onToggleFollow = () =>
    followMutation.mutate({ id: profile.id, next: !isFollowing })

  return (
    <div className="flex flex-wrap gap-2">
      {isSelf ? (
        <>
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <Button variant="primary" size="sm" onClick={onBuy}>
            <ShoppingCart />
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
          <Button variant="secondary" size="sm" onClick={onBuy}>
            <ShoppingCart />
            Buy
          </Button>
        </>
      )}
      <Button variant="outline" size="sm" onClick={onShare}>
        <Share2 />
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={onSnapshot}>
        <Camera />
        Snapshot Holders
      </Button>
    </div>
  )
}

/**
 * User Profile screen. Renders header + action buttons (by viewerRelation) +
 * metric tiles + stat tiles + the six tabs. Works in mock mode with no backend.
 */
export function ProfileScreen({ handle }: { handle: string }) {
  const { data: profile, isLoading, isError } = useProfile(handle)
  const [tab, setTab] = useState<ProfileTab>('clubs')
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">Loading profile…</p>
        ) : isError || !profile ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">
            Profile not found.
          </p>
        ) : (
          <>
            <ProfileHeader profile={profile} />
            <ProfileActions profile={profile} onEdit={() => setEditOpen(true)} />
            <MetricTiles profile={profile} />
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
