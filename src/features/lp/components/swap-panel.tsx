'use client'

/**
 * "Swap for $FANS" — Pay (ETH) / Receive ($FANS) with a live quote as the user
 * types. Direction is flippable; balances shown as "X Available". Submits via
 * the swap mutation and surfaces 400 (insufficient balance) inline.
 */
import { useQuery } from '@tanstack/react-query'
import { ArrowDownUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEthBalance, useFansBalance, useSwapQuote, useWeb3Context, web3Config } from '@/features/web3'
import { formatNumber } from '@/shared/lib/format'
import { lpErrorMessage, mockWalletBalances, quote } from '../api/lp.api'
import { useSwap } from '../hooks/use-lp'
import type { SwapDirection } from '../types'

const TOKEN = {
  eth: { symbol: 'ETH', decimals: 6 },
  fans: { symbol: '$FANS', decimals: 2 },
} as const

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
  const { mutate: doSwap, isPending, error, reset } = useSwap()

  // On-chain when a wallet is connected; otherwise the web2/mock path.
  const { address, isConnected } = useWeb3Context()
  const onchain = web3Config.enabled && isConnected

  const mockBal = useMemo(() => mockWalletBalances(), [])
  const ethBal = useEthBalance(onchain ? address ?? undefined : undefined)
  const fansBal = useFansBalance(onchain ? address ?? undefined : undefined)
  const balances = onchain
    ? { eth: Number(ethBal.data?.formatted ?? 0), fans: Number(fansBal.data?.formatted ?? 0) }
    : mockBal

  const payToken = direction === 'eth_to_fans' ? TOKEN.eth : TOKEN.fans
  const receiveToken = direction === 'eth_to_fans' ? TOKEN.fans : TOKEN.eth
  const available = direction === 'eth_to_fans' ? balances.eth : balances.fans

  // Debounce the amount so the quote fires once the user pauses typing.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(amountIn.trim()), 300)
    return () => clearTimeout(t)
  }, [amountIn])

  // On-chain AMM quote (constant-product from live reserves) when connected.
  const web3Quote = useSwapQuote(
    direction === 'eth_to_fans' ? 'ethToFans' : 'fansToEth',
    onchain ? toWei(debounced) : 0n,
  )

  const { data: quoted, isFetching: web2Quoting } = useQuery({
    queryKey: ['lp', 'quote', 'swap', direction, debounced],
    queryFn: () => quote({ action: 'swap', direction, amountIn: debounced }),
    enabled: !onchain && Number(debounced) > 0,
  })

  const amountOut = onchain ? web3Quote.data?.formatted ?? '' : quoted?.amountOut ?? ''
  const impact = onchain ? undefined : quoted?.priceImpactPct
  const quoting = onchain ? web3Quote.isFetching : web2Quoting

  function flip() {
    setDirection((d) => (d === 'eth_to_fans' ? 'fans_to_eth' : 'eth_to_fans'))
    setAmountIn('')
    setDebounced('')
    reset()
  }

  function onSubmit() {
    if (Number(amountIn) <= 0) return
    doSwap(
      { direction, amountIn },
      {
        onSuccess: () => {
          setAmountIn('')
          setDebounced('')
        },
      },
    )
  }

  const disabled = isPending || Number(amountIn) <= 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-4">
        <h2 className="text-sm font-semibold text-[var(--color-fg)]">Swap for $FANS</h2>

        {/* Pay */}
        <TokenField
          label="Pay"
          symbol={payToken.symbol}
          available={`${formatNumber(available, { compact: true })} Available`}
          value={amountIn}
          onChange={(v) => {
            reset()
            setAmountIn(v)
          }}
          onMax={() => setAmountIn(String(available))}
          editable
        />

        <div className="flex justify-center">
          <Button variant="outline" size="icon" aria-label="Swap tokens" onClick={flip}>
            <ArrowDownUp />
          </Button>
        </div>

        {/* Receive */}
        <TokenField
          label="Receive"
          symbol={receiveToken.symbol}
          value={amountOut ? formatNumber(Number(amountOut), { compact: false }) : ''}
          placeholder={quoting ? 'Quoting…' : '0.0'}
        />

        {impact != null && Number(debounced) > 0 ? (
          <p className="text-xs text-[var(--color-muted)]">
            Price impact {impact.toFixed(2)}% · 0.3% fee
          </p>
        ) : null}

        {error ? (
          <p className="text-xs text-[var(--color-negative)]" role="alert">
            {lpErrorMessage(error)}
          </p>
        ) : null}

        <Button onClick={onSubmit} disabled={disabled}>
          {isPending ? 'Swapping…' : 'Swap Tokens'}
        </Button>
      </CardContent>
    </Card>
  )
}

/** A single labelled token row (amount input + symbol + optional MAX). */
function TokenField({
  label,
  symbol,
  value,
  available,
  placeholder = '0.0',
  editable = false,
  onChange,
  onMax,
}: {
  label: string
  symbol: string
  value: string
  available?: string
  placeholder?: string
  editable?: boolean
  onChange?: (v: string) => void
  onMax?: () => void
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)]">{label}</span>
        {available ? <span className="text-xs text-[var(--color-muted)]">{available}</span> : null}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <input
          inputMode="decimal"
          readOnly={!editable}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value.replace(/[^0-9.]/g, ''))}
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
          aria-label={`${label} amount`}
        />
        {editable && onMax ? (
          <button
            type="button"
            onClick={onMax}
            className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]"
          >
            MAX
          </button>
        ) : null}
        <span className="shrink-0 text-sm font-medium text-[var(--color-fg)]">{symbol}</span>
      </div>
    </div>
  )
}
