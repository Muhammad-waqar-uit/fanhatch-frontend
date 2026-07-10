import { ClubScreen } from '@/features/club'

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClubScreen clubId={id} />
}
