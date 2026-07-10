import { REFERRAL_HERO } from '../data'
import { ReferVia } from './refer-via'
import { RewardTiles } from './reward-tiles'
import { ShareTo } from './share-to'

/**
 * Referrals screen (UI-only, no backend). A centered hero, a 2x2 grid of reward
 * tiles, a "Refer via" section (link + code cards) and a "Share to" row. All
 * values are hardcoded from the Fanhatch figma reference.
 */
export function ReferralsScreen() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-fg)] sm:text-3xl">
            {REFERRAL_HERO.titlePrefix}
            <span className="text-[var(--color-accent)]">{REFERRAL_HERO.titleAccent}</span>
            {REFERRAL_HERO.titleSuffix}
          </h1>
          <p className="max-w-xl text-sm text-[var(--color-muted)]">{REFERRAL_HERO.subtitle}</p>
        </header>

        <RewardTiles />

        <ReferVia />

        <ShareTo />
      </div>
    </div>
  )
}
