'use client'

/**
 * Swap card — ETH ⇄ $FANS on the Uniswap v4 pool. Live quote as you type, with a
 * real-DEX detail set: exchange rate, price impact (color-coded), minimum received
 * (after slippage), an estimated network fee, and the 1.5% trade fee the FansHook takes.
 * Slippage is adjustable. On-chain quotes work before connecting; swapping needs a wallet.
 */
import { useQuery } from '@tanstack/react-query'
import { useModal } from 'connectkit'
import { ArrowDown, Settings2, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useEthBalance,
  useFansBalance,
  useNetworkFee,
  usePoolReserves,
  useSwapQuote,
  useWeb3Context,
  web3Config,
} from '@/features/web3'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { mockWalletBalances, quote } from '../api/lp.api'
import { useSwap } from '../hooks/use-lp'
import type { SwapDirection } from '../types'
import { DetailRow, TOKENS, TokenField, num } from './token-ui'

/** The FansHook trade fee (bps → %). Mirrors `HOOK_FEE_BPS` in web3/reads.ts. */
const HOOK_FEE_PCT = 1.5
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0]

/** Parse a decimal string to 18-decimal wei; 0n on empty/invalid. */
function toWei(value: string): bigint {
  const v = value.trim()
  if (!v || Number(v) <= 0) return 0n
  try {
    return parseEther(v)
  } catch {
    return 0n
  }
}

export function SwapPanel() {
  const [direction, setDirection] = useState<SwapDirection>('eth_to_fans')
  const [amountIn, setAmountIn] = useState('')
  const [debounced, setDebounced] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [flipping, setFlipping] = useState(false)

  const { mutate: doSwap, isPending, error, reset } = useSwap()
  const { address, isConnected } = useWeb3Context()
  const { setOpen: openWalletModal } = useModal()

  const web3On = web3Config.enabled
  const connected = web3On && isConnected

  const mockBal = useMemo(() => mockWalletBalances(), [])
  const ethBal = useEthBalance(connected ? address ?? undefined : undefined)
  const fansBal = useFansBalance(connected ? address ?? undefined : undefined)
  const balances = connected
    ? { eth: num(ethBal.data?.formatted), fans: num(fansBal.data?.formatted) }
    : web3On
      ? null
      : mockBal

  const pay = direction === 'eth_to_fans' ? TOKENS.eth : TOKENS.fans
  const receive = direction === 'eth_to_fans' ? TOKENS.fans : TOKENS.eth
  const available = balances ? (direction === 'eth_to_fans' ? balances.eth : balances.fans) : undefined

  useEffect(() => {
    const t = setTimeout(() => setDebounced(amountIn.trim()), 300)
    return () => clearTimeout(t)
  }, [amountIn])

  const web3Quote = useSwapQuote(
    direction === 'eth_to_fans' ? 'ethToFans' : 'fansToEth',
    web3On ? toWei(debounced) : 0n,
  )
  const { data: web2Quoted, isFetching: web2Quoting } = useQuery({
    queryKey: ['lp', 'quote', 'swap', direction, debounced],
    queryFn: () => quote({ action: 'swap', direction, amountIn: debounced }),
    enabled: !web3On && num(debounced) > 0,
  })

  const reserves = usePoolReserves()
  const netFee = useNetworkFee()

  const amountOut = web3On ? web3Quote.data?.formatted ?? '' : web2Quoted?.amountOut ?? ''
  const quoting = web3On ? web3Quote.isFetching : web2Quoting
  const hasQuote = num(debounced) > 0 && num(amountOut) > 0

  const rate = hasQuote ? num(amountOut) / num(debounced) : 0
  const minReceived = hasQuote ? num(amountOut) * (1 - slippage / 100) : 0

  const impactPct = useMemo(() => {
    if (!hasQuote) return undefined
    if (!web3On) return web2Quoted?.priceImpactPct
    const rEth = reserves.data ? num(formatEther(reserves.data.eth)) : 0
    const rFans = reserves.data ? num(formatEther(reserves.data.fans)) : 0
    const spot = direction === 'eth_to_fans' ? (rEth > 0 ? rFans / rEth : 0) : rFans > 0 ? rEth / rFans : 0
    const exec = num(amountOut) / num(debounced)
    return spot > 0 && exec > 0 ? Math.max(0, ((spot - exec) / spot) * 100) : undefined
  }, [hasQuote, web3On, web2Quoted, reserves.data, direction, amountOut, debounced])

  const impactTone =
    impactPct == null
      ? 'text-[var(--color-fg)]'
      : impactPct < 1
        ? 'text-[var(--color-positive)]'
        : impactPct < 5
          ? 'text-[var(--color-fg)]'
          : 'text-[var(--color-negative)]'

  function flip() {
    setFlipping(true)
    setTimeout(() => setFlipping(false), 250)
    setDirection((d) => (d === 'eth_to_fans' ? 'fans_to_eth' : 'eth_to_fans'))
    setAmountIn('')
    setDebounced('')
    reset()
  }

  function onSubmit() {
    if (web3On && !connected) {
      openWalletModal(true)
      return
    }
    if (num(amountIn) <= 0) return
    doSwap(
      { direction, amountIn },
      { onSuccess: () => { setAmountIn(''); setDebounced('') } },
    )
  }

  const insufficient = available != null && num(amountIn) > available
  const cta = web3On && !connected
    ? { label: 'Connect wallet', disabled: false }
    : num(amountIn) <= 0
      ? { label: 'Enter an amount', disabled: true }
      : insufficient
        ? { label: `Insufficient ${pay.symbol}`, disabled: true }
        : isPending
          ? { label: 'Swapping…', disabled: true }
          : { label: `Swap ${pay.symbol} for ${receive.symbol}`, disabled: false }

  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 pt-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Swap</h2>
          <div className="relative">
            <button
              type="button"
              aria-label="Slippage settings"
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
            >
              <Settings2 className="size-3.5" />
              {slippage}%
            </button>
            {settingsOpen ? (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg">
                  <p className="mb-2 text-xs font-medium text-[var(--color-fg)]">Slippage tolerance</p>
                  <div className="flex items-center gap-1.5">
                    {SLIPPAGE_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSlippage(p)}
                        className={cn(
                          'flex-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
                          slippage === p
                            ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
                            : 'bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-fg)]',
                        )}
                      >
                        {p}%
                      </button>
                    ))}
                    <div className="flex items-center gap-1 rounded-full bg-[var(--color-surface-2)] px-2 py-1">
                      <input
                        inputMode="decimal"
                        aria-label="Custom slippage"
                        value={String(slippage)}
                        onChange={(e) => {
                          const v = Number(e.target.value.replace(/[^0-9.]/g, ''))
                          if (Number.isFinite(v) && v >= 0 && v <= 50) setSlippage(v)
                        }}
                        className="w-9 bg-transparent text-right text-xs font-medium text-[var(--color-fg)] outline-none"
                      />
                      <span className="text-xs text-[var(--color-muted)]">%</span>
                    </div>
                  </div>
                  {slippage >= 5 ? (
                    <p className="mt-2 text-[11px] text-[var(--color-negative)]">
                      High slippage — your trade may be front-run.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <TokenField
          label="You pay"
          token={pay}
          available={available}
          value={amountIn}
          editable
          onChange={(v) => { reset(); setAmountIn(v) }}
          onMax={available != null ? () => setAmountIn(String(available)) : undefined}
        />

        <div className="relative z-[1] -my-3 flex justify-center">
          <button
            type="button"
            aria-label="Switch direction"
            onClick={flip}
            className={cn(
              'flex size-9 items-center justify-center rounded-full border-4 border-[var(--color-surface)] bg-[var(--color-surface-2)] text-[var(--color-fg)] transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-fg)] motion-reduce:transition-none',
              flipping && 'rotate-180',
            )}
          >
            <ArrowDown className="size-4" />
          </button>
        </div>

        <TokenField
          label="You receive"
          token={receive}
          value={amountOut ? formatNumber(num(amountOut), { compact: false }) : ''}
          placeholder={quoting ? '' : '0.0'}
          loading={quoting}
        />

        {hasQuote ? (
          <dl className="mt-2 flex flex-col gap-1.5 rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-2.5 text-xs">
            <DetailRow term="Rate">
              1 {pay.symbol} = {formatNumber(rate, { compact: true })} {receive.symbol}
            </DetailRow>
            {impactPct != null ? (
              <DetailRow term="Price impact">
                <span className={impactTone}>{impactPct.toFixed(2)}%</span>
              </DetailRow>
            ) : null}
            <DetailRow term={`Min. received (${slippage}%)`}>
              {formatNumber(minReceived, { compact: false })} {receive.symbol}
            </DetailRow>
            {web3On ? (
              <DetailRow term="Network fee">
                {netFee.feeEth ? `≈ ${formatNumber(num(netFee.feeEth), { compact: false })} ETH` : '—'}
              </DetailRow>
            ) : null}
            <DetailRow term="Trade fee">{HOOK_FEE_PCT}% → LP stakers</DetailRow>
          </dl>
        ) : null}

        {error ? (
          <p className="mt-1 text-xs text-[var(--color-negative)]" role="alert">
            {error instanceof Error ? error.message : 'Swap failed. Try again.'}
          </p>
        ) : null}

        <Button className="mt-2" onClick={onSubmit} disabled={cta.disabled}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {cta.label}
        </Button>
      </CardContent>
    </Card>
  )
}
