'use client'

/**
 * Liquidity — provide ETH + $FANS to the v4 pool (mints FANS-LP via the vault) or
 * withdraw FANS-LP back to the underlying. Shows the caller's live on-chain position.
 * Stake the FANS-LP in the Farm tab to earn from the 1.5% trade fee.
 */
import { useMemo, useState } from 'react'
import { useModal } from 'connectkit'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useEthBalance,
  useFansBalance,
  useLpPosition,
  useWeb3Context,
  web3Config,
} from '@/features/web3'
import { formatNumber } from '@/shared/lib/format'
import { mockWalletBalances } from '../api/lp.api'
import { useAddLiquidity, usePosition, useRemoveLiquidity } from '../hooks/use-lp'
import { DetailRow, Segmented, StatTile, TOKENS, TokenField, num } from './token-ui'

export function LiquidityPanel() {
  const [mode, setMode] = useState<'add' | 'remove'>('add')

  const { address, isConnected } = useWeb3Context()
  const web3On = web3Config.enabled
  const connected = web3On && isConnected
  const { setOpen: openWalletModal } = useModal()

  const ethBal = useEthBalance(connected ? address ?? undefined : undefined)
  const fansBal = useFansBalance(connected ? address ?? undefined : undefined)
  const balances = connected
    ? { eth: num(ethBal.data?.formatted), fans: num(fansBal.data?.formatted) }
    : web3On
      ? null
      : mockWalletBalances()

  const onchainPos = useLpPosition(connected ? address ?? undefined : undefined)
  const web2Pos = usePosition()
  const pos = useMemo(() => {
    if (connected && onchainPos.data) {
      const shares = num(onchainPos.data.shares.formatted)
      const total = num(onchainPos.data.totalShares.formatted)
      return {
        shares,
        eth: num(onchainPos.data.ethShare.formatted),
        fans: num(onchainPos.data.fansShare.formatted),
        sharePct: total > 0 ? (shares / total) * 100 : 0,
      }
    }
    return {
      shares: num(web2Pos.data?.shares),
      eth: num(web2Pos.data?.ethShare),
      fans: num(web2Pos.data?.fansShare),
      sharePct: 0,
    }
  }, [connected, onchainPos.data, web2Pos.data])

  return (
    <div className="flex flex-col gap-3">
      {/* Position */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-fg)]">Your position</h2>
            {pos.sharePct > 0 ? (
              <span className="text-xs text-[var(--color-muted)]">{pos.sharePct.toFixed(2)}% of pool</span>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatTile label="FANS-LP" value={formatNumber(pos.shares, { compact: true })} />
            <StatTile label="Pooled ETH" value={formatNumber(pos.eth, { compact: false })} />
            <StatTile label="Pooled $FANS" value={formatNumber(pos.fans, { compact: true })} />
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Stake your FANS-LP in the <span className="text-[var(--color-fg)]">Farm</span> tab to earn a
            share of the 1.5% trade fee, paid in $FANS.
          </p>
        </CardContent>
      </Card>

      <Segmented options={['add', 'remove'] as const} value={mode} onChange={setMode} />

      {mode === 'add' ? (
        <AddForm
          balances={balances}
          web3On={web3On}
          connected={connected}
          onConnect={() => openWalletModal(true)}
        />
      ) : (
        <RemoveForm
          shares={pos.shares}
          web3On={web3On}
          connected={connected}
          onConnect={() => openWalletModal(true)}
        />
      )}
    </div>
  )
}

function AddForm({
  balances,
  web3On,
  connected,
  onConnect,
}: {
  balances: { eth: number; fans: number } | null
  web3On: boolean
  connected: boolean
  onConnect: () => void
}) {
  const [ethIn, setEthIn] = useState('')
  const [fansIn, setFansIn] = useState('')
  const { mutate, isPending, error, reset } = useAddLiquidity()

  const overEth = balances != null && num(ethIn) > balances.eth
  const overFans = balances != null && num(fansIn) > balances.fans
  const cta = web3On && !connected
    ? { label: 'Connect wallet', disabled: false }
    : num(ethIn) <= 0 || num(fansIn) <= 0
      ? { label: 'Enter amounts', disabled: true }
      : overEth || overFans
        ? { label: `Insufficient ${overEth ? 'ETH' : '$FANS'}`, disabled: true }
        : isPending
          ? { label: 'Adding…', disabled: true }
          : { label: 'Add liquidity', disabled: false }

  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 pt-4">
        <TokenField
          label="Deposit"
          token={TOKENS.eth}
          available={balances?.eth}
          value={ethIn}
          editable
          onChange={(v) => { reset(); setEthIn(v) }}
          onMax={balances ? () => setEthIn(String(balances.eth)) : undefined}
        />
        <TokenField
          label="Deposit"
          token={TOKENS.fans}
          available={balances?.fans}
          value={fansIn}
          editable
          onChange={(v) => { reset(); setFansIn(v) }}
          onMax={balances ? () => setFansIn(String(balances.fans)) : undefined}
        />
        <dl className="mt-1 rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2.5 text-xs">
          <DetailRow term="You receive">FANS-LP (pool share)</DetailRow>
          <p className="mt-1 text-[var(--color-muted)]">
            Added at the current pool ratio — any excess of either token is refunded.
          </p>
        </dl>
        {error ? (
          <p className="mt-1 text-xs text-[var(--color-negative)]" role="alert">
            {error instanceof Error ? error.message : 'Could not add liquidity.'}
          </p>
        ) : null}
        <Button
          className="mt-2"
          disabled={cta.disabled}
          onClick={() => {
            if (web3On && !connected) return onConnect()
            mutate({ ethIn, fansIn }, { onSuccess: () => { setEthIn(''); setFansIn('') } })
          }}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {cta.label}
        </Button>
      </CardContent>
    </Card>
  )
}

function RemoveForm({
  shares,
  web3On,
  connected,
  onConnect,
}: {
  shares: number
  web3On: boolean
  connected: boolean
  onConnect: () => void
}) {
  const [amount, setAmount] = useState('')
  const { mutate, isPending, error, reset } = useRemoveLiquidity()

  const over = num(amount) > shares
  const cta = web3On && !connected
    ? { label: 'Connect wallet', disabled: false }
    : num(amount) <= 0
      ? { label: 'Enter an amount', disabled: true }
      : over
        ? { label: 'Insufficient FANS-LP', disabled: true }
        : isPending
          ? { label: 'Removing…', disabled: true }
          : { label: 'Remove liquidity', disabled: false }

  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 pt-4">
        <TokenField
          label="Withdraw"
          token={TOKENS.lp}
          available={connected || !web3On ? shares : undefined}
          value={amount}
          editable
          onChange={(v) => { reset(); setAmount(v) }}
          onMax={() => setAmount(String(shares))}
        />
        <p className="mt-1 px-1 text-xs text-[var(--color-muted)]">
          Burns FANS-LP for the underlying ETH + $FANS.
        </p>
        {error ? (
          <p className="mt-1 text-xs text-[var(--color-negative)]" role="alert">
            {error instanceof Error ? error.message : 'Could not remove liquidity.'}
          </p>
        ) : null}
        <Button
          className="mt-2"
          variant="secondary"
          disabled={cta.disabled}
          onClick={() => {
            if (web3On && !connected) return onConnect()
            mutate(amount, { onSuccess: () => setAmount('') })
          }}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {cta.label}
        </Button>
      </CardContent>
    </Card>
  )
}
