import { ProfileScreen } from '@/features/profile'

/** Public profile page, resolved by @handle (or #userId). */
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  return <ProfileScreen handle={handle} />
}
