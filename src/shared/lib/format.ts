/** Display formatters used across features. */

export function formatUsd(value: number, opts: { compact?: boolean } = {}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: opts.compact ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, opts: { compact?: boolean } = {}): string {
  return new Intl.NumberFormat('en-US', {
    notation: opts.compact ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/** Relative "2m ago" style time from an ISO string or Date. */
export function timeAgo(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [7, 'd'],
    [4.345, 'w'],
    [12, 'mo'],
    [Number.POSITIVE_INFINITY, 'y'],
  ]
  let value = seconds
  let unit = 's'
  for (const [step, label] of units) {
    if (value < step) {
      unit = label
      break
    }
    value = Math.floor(value / step)
    unit = label
  }
  return `${value}${unit}`
}
