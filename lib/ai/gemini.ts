import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider } from '@/types'

function createGeminiProvider(): AIProvider {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

  return {
    name: 'gemini-2.5-pro',
    async generate(prompt: string): Promise<string> {
      const model = client.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: { responseMimeType: 'application/json' },
      })
      const result = await model.generateContent(prompt)
      return result.response.text()
    },
  }
}

export const geminiProvider = createGeminiProvider()
