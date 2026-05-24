import { z } from 'zod'

import {
  REVIEW_CATEGORIES,
  REVIEW_MODES,
  REVIEW_SEVERITIES,
} from './enums'

export const ReviewFindingSchema = z.object({
  id: z.string(),

  severity: z.enum(REVIEW_SEVERITIES),

  category: z.enum(REVIEW_CATEGORIES),

  title: z.string(),

  description: z.string(),

  recommendation: z.string(),

  file: z.string(),

  lineStart: z.number().optional(),

  lineEnd: z.number().optional(),
})

export type ReviewFinding =
  z.infer<typeof ReviewFindingSchema>

export const ReviewResultSchema = z.object({
  reviewId: z.string(),

  repository: z.string(),

  branch: z.string(),

  mode: z.enum(REVIEW_MODES),

  generatedAt: z.string(),

  findings: z.array(ReviewFindingSchema),
})

export type ReviewResult =
  z.infer<typeof ReviewResultSchema>