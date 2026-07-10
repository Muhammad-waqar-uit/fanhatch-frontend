import type { SparkPoint } from '../types'

interface SparklineProps {
  history: SparkPoint[]
  up: boolean
  width?: number
  height?: number
  className?: string
}

/**
 * Small presentational SVG sparkline, mirroring the feed's inline club chart.
 * Line color follows price direction (positive / negative token).
 */
export function Sparkline({ history, up, width = 132, height = 40, className }: SparklineProps) {
  const stroke = up ? 'var(--color-positive)' : 'var(--color-negative)'
  const prices = history.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const step = prices.length > 1 ? width / (prices.length - 1) : width

  const coords = prices.map((price, i) => {
    const x = i * step
    // Invert y: higher price = smaller y.
    const y = height - ((price - min) / span) * (height - 6) - 3
    return { x, y }
  })

  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `0,${height} ${line} ${width},${height}`
  const gradId = `spark-${up ? 'up' : 'down'}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
