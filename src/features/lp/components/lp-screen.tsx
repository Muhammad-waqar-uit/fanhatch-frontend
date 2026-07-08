'use client'

/**
 * LP screen: Swap · Liquidity · Farm. Header shows the live pool ratio and
 * derived $FANS price so the user has pool context across every tab.
 */
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNumber } from '@/shared/lib/format'
import { usePool } from '../hooks/use-lp'
import { FarmPanel } from './farm-panel'
import { LiquidityPanel } from './liquidity-panel'
import { SwapPanel } from './swap-panel'

export function LpScreen() {
  const [tab, setTab] = useState('swap')
  const { data: pool } = usePool()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-[var(--color-fg)]">Your LP</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Provide ETH &amp; $FANS liquidity, earn a share of swap fees, and claim rewards in $FANS.
        </p>
        {pool ? (
          <p className="text-xs text-[var(--color-muted)]">
            Pool rate · 1 ETH ≈ {formatNumber(Number(pool.fansPerEth), { compact: true })} $FANS
          </p>
        ) : null}
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="swap" className="flex-1">
            Swap
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="flex-1">
            Liquidity
          </TabsTrigger>
          <TabsTrigger value="farm" className="flex-1">
            Farm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="mt-4">
          <SwapPanel />
        </TabsContent>
        <TabsContent value="liquidity" className="mt-4">
          <LiquidityPanel />
        </TabsContent>
        <TabsContent value="farm" className="mt-4">
          <FarmPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
