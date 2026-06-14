import type { AIProvider } from '@/types'
import { getSelectedModel } from './model-discovery'

export async function createOpenRouterProvider(): Promise<AIProvider> {
  const selected = await getSelectedModel()
  const modelId = selected?.modelId ?? 'meta-llama/llama-3.3-70b-instruct:free'

  return {
    name: modelId,
    async generate(prompt: string): Promise<string> {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Reviewer',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`OpenRouter error ${res.status}: ${err}`)
      }

      const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>
      }
      return data.choices[0]?.message?.content ?? ''
    },
  }
}
