import { NextRequest } from 'next/server'
import { readAllReviews, deleteReview } from '@/lib/storage/read'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const repo = searchParams.get('repo')
  const mode = searchParams.get('mode')

  let reviews = readAllReviews()

  if (repo) reviews = reviews.filter((r) => r.repo === repo)
  if (mode) reviews = reviews.filter((r) => r.reviewMode === mode)

  return Response.json(reviews)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const deleted = deleteReview(id)
  return Response.json({ deleted })
}
