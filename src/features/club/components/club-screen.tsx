'use client'

import { ArrowLeft, KeyRound, Share2, Star, TableProperties } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/lib/cn'
import { useBuyClubKey, useClub, useClubPresident } from '../hooks/use-club'
import type { ClubStanding } from '../types'
import { ClubChart } from './club-chart'

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(iso))

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

export function ClubScreen({ clubId }: { clubId: string }) {
  const router = useRouter()
  const { data: club, isLoading, isError } = useClub(clubId)
  const { data: president } = useClubPresident(clubId)
  const buy = useBuyClubKey(clubId)
  const [tab, setTab] = useState('members')
  const [memberQuery, setMemberQuery] = useState('')

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-[var(--color-muted)]">Loading club…</div>
  }
  if (isError || !club) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-muted)]">
        Couldn’t load this club.
      </div>
    )
  }

  const keyPrice = Number(club.keyPrice) || 0
  const clubValue = keyPrice * (club.supply || 0)
  const standings: ClubStanding[] = president?.standings ?? []
  const presidentId = president?.president?.id
  const members = standings.filter((s) =>
    memberQuery ? s.candidate.name.toLowerCase().includes(memberQuery.toLowerCase()) : true,
  )

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="mb-4 flex size-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
          >
            <ArrowLeft className="size-5" />
          </button>

          <Card>
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  <Avatar className="size-20 rounded-2xl">
                    {club.avatarUrl ? <AvatarImage src={club.avatarUrl} alt={club.name} /> : null}
                    <AvatarFallback className="rounded-2xl">{initials(club.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-bold text-[var(--color-fg)]">{club.name}</h1>
                    <p className="text-sm text-[var(--color-muted)]">{club.memberCount} Members</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge>${club.ticker}</Badge>
                      <Badge>{club.ftId}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => club.chatRoomId && router.push('/chat')}>
                      Chat
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => buy.mutate(1)} disabled={buy.isPending}>
                      <KeyRound className="size-4" />
                      {buy.isPending ? 'Buying…' : 'Buy'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] rounded-[var(--radius)] border border-[var(--color-border)]">
                    <div className="px-4 py-2 text-center">
                      <div className="font-semibold text-[var(--color-fg)]">{clubValue.toFixed(2)}</div>
                      <div className="text-xs text-[var(--color-muted)]">Club Value</div>
                    </div>
                    <div className="px-4 py-2 text-center">
                      <div className="font-semibold text-[var(--color-positive)]">{keyPrice.toFixed(4)}</div>
                      <div className="text-xs text-[var(--color-muted)]">Key Price</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                Created {monthYear(club.created)} by
                <span className="font-medium text-[var(--color-fg)]">@{club.creator.handle}</span>
              </p>
              {club.description ? (
                <p className="mt-2 text-sm text-[var(--color-fg)]">{club.description}</p>
              ) : null}

              <div className="mt-3 flex gap-5 text-sm font-medium text-[var(--color-accent)]">
                <button type="button" className="flex items-center gap-1.5 hover:underline">
                  <Share2 className="size-4" /> Share
                </button>
                <button type="button" className="flex items-center gap-1.5 hover:underline">
                  <TableProperties className="size-4" /> Snapshot Holders
                </button>
              </div>

              {/* Chart */}
              <div className="mt-5">
                <ClubChart price={keyPrice} seed={club.clubId % 7} />
              </div>

              {/* Tabs */}
              <Tabs value={tab} onValueChange={setTab} className="mt-5">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-4">
                  <div className="rounded-[var(--radius)] border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-muted)]">
                    No recent activity yet.
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-4 flex flex-col gap-3">
                  <Input
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Search for members"
                    aria-label="Search for members"
                  />
                  {members.length === 0 ? (
                    <div className="rounded-[var(--radius)] border border-dashed border-[var(--color-border)] py-10 text-center text-sm text-[var(--color-muted)]">
                      No members to show yet.
                    </div>
                  ) : (
                    members.map((s) => (
                      <div key={s.candidate.id} className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3 last:border-0">
                        <Avatar className="size-9">
                          {s.candidate.avatarUrl ? (
                            <AvatarImage src={s.candidate.avatarUrl} alt={s.candidate.name} />
                          ) : null}
                          <AvatarFallback>{initials(s.candidate.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="font-semibold text-[var(--color-fg)]">{s.candidate.name}</span>
                            {s.candidate.id === presidentId ? (
                              <span className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-accent)]">
                                <Star className="size-3 fill-current" /> President
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-[var(--color-muted)]">
                            {s.candidate.handle ?? ''} · <span className="text-[var(--color-accent)]">{s.votes} votes</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Follow
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Trade Keys panel */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--color-fg)]">Trade Keys</h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="size-10">
                  {club.avatarUrl ? <AvatarImage src={club.avatarUrl} alt={club.name} /> : null}
                  <AvatarFallback>{initials(club.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-fg)]">{club.name}</div>
                  <div className="text-xs text-[var(--color-muted)]">You own 0 keys</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <TradeStat label="Buy Price" value={keyPrice.toFixed(4)} />
                <TradeStat label="Sell Price" value={(keyPrice * 0.95).toFixed(4)} />
              </div>

              <Button
                variant="primary"
                className="mt-4 w-full"
                onClick={() => buy.mutate(1)}
                disabled={buy.isPending}
              >
                {buy.isPending ? 'Buying…' : 'Buy Key'}
              </Button>
              <Button variant="outline" className="mt-2 w-full" disabled title="Selling coming soon">
                Sell Key
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TradeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn('rounded-[var(--radius)] bg-[var(--color-surface-2)] p-2.5 text-center')}>
      <div className="flex items-center justify-center gap-1.5 font-semibold text-[var(--color-fg)]">
        <span className="size-2 rounded-full bg-[var(--color-positive)]" />
        {value}
      </div>
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
    </div>
  )
}
