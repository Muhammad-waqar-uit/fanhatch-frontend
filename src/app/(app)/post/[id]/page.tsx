import { PostDetail } from '@/features/dashboard'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PostDetail id={id} />
}
