import type { FileReview } from './types'

export function generateSummary(
  reviews: FileReview[],
) {
  const totalIssues =
    reviews.reduce(
      (acc, review) =>
        acc + review.issues.length,
      0,
    )

  return `
Review completed successfully.

Files reviewed: ${reviews.length}
Issues detected: ${totalIssues}
`
}