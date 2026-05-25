import { GoogleGenerativeAI } from '@google/generative-ai'

const client = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || '',
)

export async function reviewWithGemini(
  prompt: string,
) {
  const model =
    client.getGenerativeModel({
      model: 'gemini-2.5-pro',
    })

  const response =
    await model.generateContent(prompt)

  return response.response.text()
}