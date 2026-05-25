import {
  generateDiff,
  getChangedFiles,
  getCurrentBranch,
} from '@repo/git-engine'

import { runAIReview } from '@repo/ai-engine'

import { formatReview } from './formatter'
import { buildReport } from './report'

export async function runReviewPipeline(
  repositoryPath: string,
  targetBranch = 'main',
) {
  const branch =
    getCurrentBranch(repositoryPath)

  const diff = generateDiff(
    repositoryPath,
    targetBranch,
  )

  const files = getChangedFiles(
    repositoryPath,
    targetBranch,
  )

  const reviews = []

  for (const file of files) {
    const aiReview =
      await runAIReview(diff)

    const formatted =
      formatReview(
        aiReview,
        file.path,
      )

    reviews.push(formatted)
  }

  return buildReport(
    repositoryPath,
    branch,
    targetBranch,
    reviews,
  )
}