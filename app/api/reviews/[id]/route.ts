import { NextRequest } from 'next/server'
import { readReview } from '@/lib/storage/read'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const review = readReview(id)

  if (!review) {
    return Response.json({ error: 'Review not found' }, { status: 404 })
  }

  return Response.json(review)
}
