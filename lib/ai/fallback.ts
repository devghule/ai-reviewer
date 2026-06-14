import type { AIProvider } from '@/types'
import { geminiProvider } from './gemini'
import { createOpenRouterProvider } from './openrouter'

export async function generateWithFallback(prompt: string): Promise<string> {
  const errors: string[] = []

  // Primary: Gemini
  try {
    return await geminiProvider.generate(prompt)
  } catch (err) {
    errors.push(`Gemini: ${err instanceof Error ? err.message : String(err)}`)
    console.warn('[ai] Gemini failed, trying fallback:', errors[0])
  }

  // Fallback: OpenRouter free model
  try {
    const openRouter = await createOpenRouterProvider()
    return await openRouter.generate(prompt)
  } catch (err) {
    errors.push(`OpenRouter: ${err instanceof Error ? err.message : String(err)}`)
    console.error('[ai] Both providers failed:', errors)
  }

  throw new Error(`All AI providers failed:\n${errors.join('\n')}`)
}
