import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function reviewWithClaude(
  prompt: string,
) {
  const response =
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

  return response.content
    .map((item) =>
      item.type === 'text'
        ? item.text
        : '',
    )
    .join('\n')
}