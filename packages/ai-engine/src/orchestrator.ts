import { reviewWithClaude } from './providers/claude'
import { reviewWithGemini } from './providers/gemini'
import { reviewWithOpenAI } from './providers/openai'

import { withFallback } from './fallback'
import { buildReviewPrompt } from './prompt'

export async function runAIReview(
  diff: string,
) {
  const prompt =
    buildReviewPrompt(diff)

  const result = await withFallback([
    () => reviewWithOpenAI(prompt),
    () => reviewWithClaude(prompt),
    () => reviewWithGemini(prompt),
  ])

  return result
}