import { z } from 'zod'

export const StoredReviewSchema = z.object({
  id: z.string(),

  createdAt: z.string(),

  filePath: z.string(),
})

export type StoredReview =
  z.infer<typeof StoredReviewSchema>