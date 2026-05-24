import { z } from 'zod'

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),

  OPENAI_API_KEY: z.string().optional(),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    'Invalid environment configuration:',
    parsed.error.flatten().fieldErrors,
  )

  process.exit(1)
}

export const env = parsed.data