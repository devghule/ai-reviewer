import { z } from 'zod'

export const AIProviderResponseSchema = z.object({
  provider: z.string(),

  model: z.string(),

  durationMs: z.number(),

  promptTokens: z.number(),

  completionTokens: z.number(),

  rawResponse: z.string(),
})

export type AIProviderResponse =
  z.infer<typeof AIProviderResponseSchema>