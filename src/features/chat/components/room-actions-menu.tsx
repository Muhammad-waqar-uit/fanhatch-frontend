'use client'

import { Gift, MoreHorizontal, Vote } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ChatRoom } from '../types'
import { GiftKeyDialog } from './gift-key-dialog'
import { VotePresidentDialog } from './vote-president-dialog'

/**
 * Room actions. Both "Gift a key" and "Vote for president" act on a club and so
 * require a `clubId` (they're disabled for DMs). Gifting opens the gift dialog;
 * voting opens the president governance dialog.
 */
export function RoomActionsMenu({ room }: { room: ChatRoom }) {
  const [giftOpen, setGiftOpen] = useState(false)
  const [voteOpen, setVoteOpen] = useState(false)
  const isClub = Boolean(room.clubId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Room actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!isClub}
            onSelect={() => {
              if (isClub) setGiftOpen(true)
            }}
          >
            <Gift className="size-4" />
            Gift a key
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!isClub}
            onSelect={() => {
              if (isClub) setVoteOpen(true)
            }}
          >
            <Vote className="size-4" />
            Vote for president
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {giftOpen && isClub ? (
        <GiftKeyDialog room={room} onClose={() => setGiftOpen(false)} />
      ) : null}

      {voteOpen && isClub ? (
        <VotePresidentDialog room={room} onClose={() => setVoteOpen(false)} />
      ) : null}
    </>
  )
}
