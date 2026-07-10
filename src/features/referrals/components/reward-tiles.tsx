import { Card } from '@/components/ui/card'
import { cn } from '@/shared/lib/cn'
import { REWARD_TILES } from '../data'

/** 2x2 grid of reward tiles, each with a small colored icon chip (figma). */
export function RewardTiles() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {REWARD_TILES.map(({ icon: Icon, chipClassName, title, subtitle }) => (
        <Card key={subtitle} className="flex items-center gap-3 bg-[var(--color-surface-2)] p-4">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)]',
              chipClassName,
            )}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-fg)]">{title}</p>
            <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
