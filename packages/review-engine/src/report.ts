import type {
  FileReview,
  ReviewReport,
} from './types'

import { generateSummary } from './summary'

export function buildReport(
  repository: string,
  branch: string,
  targetBranch: string,
  reviews: FileReview[],
): ReviewReport {
  return {
    repository,
    branch,
    targetBranch,
    summary:
      generateSummary(reviews),
    reviews,
    generatedAt:
      new Date().toISOString(),
  }
}