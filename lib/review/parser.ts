import { z } from 'zod'
import { ReviewFindingSchema } from '@/types'
import type { ReviewFinding } from '@/types'

const RawFindingSchema = ReviewFindingSchema.extend({
  id: z.string().optional(),
  learning: z.string().nullable().optional(),
}).passthrough()

export function parseAIResponse(raw: string): ReviewFinding[] {
  const cleaned = extractJSON(raw)

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.warn('[parser] AI response was not valid JSON:', raw.slice(0, 200))
    return []
  }

  if (!Array.isArray(parsed)) {
    console.warn('[parser] AI response was not an array')
    return []
  }

  const findings: ReviewFinding[] = []
  let idCounter = 0

  for (const item of parsed) {
    const result = RawFindingSchema.safeParse(item)
    if (!result.success) {
      console.warn('[parser] Skipping invalid finding:', result.error.flatten())
      continue
    }

    const data = result.data

    // Discard low-confidence findings
    if ((data.confidence ?? 0) < 0.65) continue

    findings.push({
      id: data.id ?? `finding-${++idCounter}`,
      severity: data.severity,
      category: data.category,
      title: data.title,
      description: data.description,
      impact: data.impact,
      recommendation: data.recommendation,
      learning: data.learning ?? undefined,
      confidence: data.confidence,
      affectedFiles: data.affectedFiles ?? [],
    })
  }

  return findings
}

function extractJSON(raw: string): string {
  // Strip markdown code fences if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch?.[1]) return fenceMatch[1].trim()

  // Find the first [ and last ]
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1)
  }

  return raw.trim()
}
