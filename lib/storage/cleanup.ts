import fs from 'node:fs'
import path from 'node:path'

const REVIEWS_DIR = path.join(process.cwd(), 'reviews')
const RETENTION_DAYS_DEFAULT = 14

export function runCleanup(retentionDays = RETENTION_DAYS_DEFAULT): number {
  if (!fs.existsSync(REVIEWS_DIR)) return 0

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  let deleted = 0

  for (const file of fs.readdirSync(REVIEWS_DIR)) {
    if (!file.endsWith('.json')) continue

    const filePath = path.join(REVIEWS_DIR, file)
    const stat = fs.statSync(filePath)

    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filePath)
      deleted++
    }
  }

  if (deleted > 0) {
    console.log(`[cleanup] Deleted ${deleted} reviews older than ${retentionDays} days`)
  }

  return deleted
}
