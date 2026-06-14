import type { ChangedFile } from '@/types'

const DTO_PATTERNS = [
  /dto/i,
  /request\.(ts|java|kt)$/i,
  /response\.(ts|java|kt)$/i,
  /model\.(ts|java|kt)$/i,
  /schema\.(ts|java|kt)$/i,
  /payload\.(ts|java|kt)$/i,
  /contract\.(ts|java|kt)$/i,
]

const ENUM_PATTERNS = [
  /enum\.(ts|java|kt)$/i,
  /enums\//i,
  /status\.(ts|java|kt)$/i,
  /type\.(ts|java|kt)$/i,
]

const API_PATTERNS = [
  /controller\.(ts|java|kt)$/i,
  /router\.(ts|js)$/i,
  /routes\.(ts|js)$/i,
  /api\//i,
  /endpoint/i,
]

const VALIDATION_PATTERNS = [
  /validator\.(ts|java|kt)$/i,
  /validation\.(ts|java|kt)$/i,
  /rules\.(ts|java|kt)$/i,
]

export interface CrossRepoDetectionResult {
  detected: boolean
  reasons: string[]
  affectedPatterns: string[]
}

export function detectCrossRepoImpact(
  files: ChangedFile[],
): CrossRepoDetectionResult {
  const reasons: string[] = []
  const affectedPatterns: string[] = []

  for (const file of files) {
    if (file.status === 'deleted') continue

    const path = file.path

    if (DTO_PATTERNS.some((p) => p.test(path))) {
      reasons.push(`DTO/contract file changed: ${path}`)
      affectedPatterns.push('dto')
    }

    if (ENUM_PATTERNS.some((p) => p.test(path))) {
      reasons.push(`Enum/status file changed: ${path}`)
      affectedPatterns.push('enum')
    }

    if (API_PATTERNS.some((p) => p.test(path))) {
      reasons.push(`API endpoint file changed: ${path}`)
      affectedPatterns.push('api')
    }

    if (VALIDATION_PATTERNS.some((p) => p.test(path))) {
      reasons.push(`Validation rule file changed: ${path}`)
      affectedPatterns.push('validation')
    }
  }

  const unique = [...new Set(reasons)]
  const uniquePatterns = [...new Set(affectedPatterns)]

  return {
    detected: unique.length > 0,
    reasons: unique,
    affectedPatterns: uniquePatterns,
  }
}
