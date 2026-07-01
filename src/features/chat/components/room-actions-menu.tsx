'use client'

import { Gift, MoreHorizontal, Vote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ChatRoom } from '../types'

/**
 * Room actions. Items would launch a signed transaction later
 * (gift a club key / cast a governance vote); stubbed to console for now.
 */
export function RoomActionsMenu({ room }: { room: ChatRoom }) {
  const giftKey = () => console.log('[chat] gift a key ->', room.id)
  const voteForPresident = () => console.log('[chat] vote for president ->', room.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Room actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={giftKey}>
          <Gift className="size-4" />
          Gift a key
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={voteForPresident}>
          <Vote className="size-4" />
          Vote for president
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
