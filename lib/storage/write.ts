import fs from 'node:fs'
import path from 'node:path'
import type { ReviewReport } from '@/types'

const REVIEWS_DIR = path.join(process.cwd(), 'reviews')

export async function writeReview(report: ReviewReport): Promise<string> {
  fs.mkdirSync(REVIEWS_DIR, { recursive: true })

  const date = new Date(report.timestamp).toISOString().split('T')[0]
  const filename = `${date}-${report.repo}-${report.reviewMode}-${report.id.slice(0, 8)}.json`
  const filePath = path.join(REVIEWS_DIR, filename)

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8')

  return filename
}
