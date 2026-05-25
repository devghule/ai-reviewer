import type {
  FileReview,
  ReviewIssue,
} from './types'

import { calculateSeverity } from './severity'

export function formatReview(
  raw: string,
  file: string,
): FileReview {
  const lines = raw
    .split('\n')
    .filter(Boolean)

  const issues: ReviewIssue[] =
    lines.map((line) => ({
      severity:
        calculateSeverity(line),
      category: 'general',
      message: line,
    }))

  return {
    file,
    issues,
  }
}