'use client'

/**
 * LP screen — "Claims & Liquidity". Two columns: the "Your LP" rewards/claim card on
 * the left, and a Swap · LP tabbed card on the right. The LP tab stacks the provide-
 * liquidity form and the FANS-LP staking (Farm) controls.
 */
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FarmPanel } from './farm-panel'
import { LiquidityPanel } from './liquidity-panel'
import { RewardsCard } from './rewards-card'
import { SwapPanel } from './swap-panel'

export function LpScreen() {
  const [tab, setTab] = useState('swap')

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[var(--color-fg)] sm:text-3xl">Claims &amp; Liquidity</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Claim your rewards and manage liquidity pools
        </p>
      </header>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <RewardsCard />

        <Card>
          <CardContent className="pt-5">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="swap">Swap</TabsTrigger>
                <TabsTrigger value="lp">LP</TabsTrigger>
              </TabsList>

              <TabsContent value="swap" className="mt-4">
                <SwapPanel />
              </TabsContent>
              <TabsContent value="lp" className="mt-4 flex flex-col gap-4">
                <LiquidityPanel />
                <div className="border-t border-[var(--color-border)]" />
                <FarmPanel />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
