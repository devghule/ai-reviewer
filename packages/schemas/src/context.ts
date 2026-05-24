import { z } from 'zod'

export const ContextSummarySchema = z.object({
  repository: z.string(),

  generatedAt: z.string(),

  architecture: z.string(),

  patterns: z.array(z.string()),

  conventions: z.array(z.string()),

  importantFiles: z.array(z.string()),
})

export type ContextSummary =
  z.infer<typeof ContextSummarySchema>