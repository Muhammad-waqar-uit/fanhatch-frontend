import { Composer } from './composer'
import { Feed } from './feed'
import { NewMembersCard } from './new-members-card'
import { TrendingPanel } from './trending-panel'

/**
 * Home feed layout: a centered content column (composer + new-members hook +
 * feed) and a right-hand trending sidebar that collapses below xl. Owns its
 * own scroll since the AppShell <main> is overflow-hidden.
 */
export function DashboardScreen() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 py-6">
        <div className="mx-auto flex w-full max-w-[600px] min-w-0 flex-col gap-4">
          <Composer />
          <NewMembersCard />
          <Feed />
        </div>

        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-0">
            <TrendingPanel />
          </div>
        </aside>
      </div>
    </div>
  )
}
