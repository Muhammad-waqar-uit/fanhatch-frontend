'use client'

/**
 * Club key-price chart with a 12-month axis (figma club profile). The backend has
 * no price history yet, so the series is synthesized deterministically from the
 * current price + a seed — a plausible upward trend, not live data.
 * ponytail: swap for a real price-history endpoint when one exists.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function series(current: number, seed: number): number[] {
  const start = Math.max(current * 0.25, 0.001)
  const step = (current - start) / 11
  return MONTHS.map((_, i) => {
    const wobble = Math.sin((i + seed) * 1.2) * current * 0.06
    return Math.max(0.0001, start + step * i + wobble)
  })
}

export function ClubChart({ price, seed = 3 }: { price: number; seed?: number }) {
  const pts = series(price || 1, seed)
  const w = 720
  const h = 240
  const pad = 8
  const max = Math.max(...pts)
  const min = Math.min(...pts)
  const span = max - min || 1
  const x = (i: number) => pad + (i * (w - pad * 2)) / (pts.length - 1)
  const y = (v: number) => pad + (1 - (v - min) / span) * (h - pad * 2)
  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
  const area = `${line} L ${x(pts.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" preserveAspectRatio="none" role="img" aria-label="Club key price trend">
        <defs>
          <linearGradient id="clubArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-positive)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-positive)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#clubArea)" />
        <path d={line} fill="none" stroke="var(--color-positive)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-[var(--color-muted)]">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}
