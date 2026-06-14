import fs from 'node:fs'
import path from 'node:path'
import { ReviewReportSchema } from '@/types'
import type { ReviewReport } from '@/types'

const REVIEWS_DIR = path.join(process.cwd(), 'reviews')

export function readAllReviews(): ReviewReport[] {
  if (!fs.existsSync(REVIEWS_DIR)) return []

  const files = fs
    .readdirSync(REVIEWS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse() // newest first

  const reviews: ReviewReport[] = []

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(REVIEWS_DIR, file), 'utf-8')
      const parsed = ReviewReportSchema.safeParse(JSON.parse(raw))
      if (parsed.success) reviews.push(parsed.data)
    } catch {
      // Skip corrupted files silently
    }
  }

  return reviews
}

export function readReview(id: string): ReviewReport | null {
  if (!fs.existsSync(REVIEWS_DIR)) return null

  const files = fs.readdirSync(REVIEWS_DIR).filter((f) => f.includes(id.slice(0, 8)))

  if (files.length === 0) return null

  try {
    const raw = fs.readFileSync(path.join(REVIEWS_DIR, files[0]!), 'utf-8')
    const parsed = ReviewReportSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function deleteReview(id: string): boolean {
  if (!fs.existsSync(REVIEWS_DIR)) return false

  const files = fs.readdirSync(REVIEWS_DIR).filter((f) => f.includes(id.slice(0, 8)))

  if (files.length === 0) return false

  fs.unlinkSync(path.join(REVIEWS_DIR, files[0]!))
  return true
}
