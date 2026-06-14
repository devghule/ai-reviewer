import fs from 'node:fs'
import path from 'node:path'
import type { DiscoveredModel, SelectedModel } from '@/types'

const SELECTED_MODEL_PATH = path.join(process.cwd(), 'config', 'selected-model.json')
const CURATED_MODELS_PATH = path.join(process.cwd(), 'config', 'curated-models.json')
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CuratedConfig {
  blockedProviders: string[]
  minContextLength: number
  preferredModels: Array<{ id: string; name: string; priority: number }>
}

interface OpenRouterModel {
  id: string
  name: string
  context_length: number
  pricing: { prompt: string; completion: string }
}

export async function getSelectedModel(): Promise<SelectedModel | null> {
  if (!fs.existsSync(SELECTED_MODEL_PATH)) return null

  try {
    const raw = fs.readFileSync(SELECTED_MODEL_PATH, 'utf-8')
    return JSON.parse(raw) as SelectedModel
  } catch {
    return null
  }
}

export async function runModelDiscovery(): Promise<SelectedModel | null> {
  const existing = await getSelectedModel()

  // Skip if checked within the last 24h
  if (existing) {
    const age = Date.now() - new Date(existing.discoveredAt).getTime()
    if (age < CHECK_INTERVAL_MS) return existing
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[model-discovery] No OPENROUTER_API_KEY, skipping discovery')
    return existing
  }

  try {
    const curated = JSON.parse(
      fs.readFileSync(CURATED_MODELS_PATH, 'utf-8'),
    ) as CuratedConfig

    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    })

    if (!res.ok) throw new Error(`OpenRouter models API: ${res.status}`)

    const data = (await res.json()) as { data: OpenRouterModel[] }

    const freeModels = data.data.filter((m) => {
      const isFree =
        m.pricing.prompt === '0' && m.pricing.completion === '0'
      const hasContext = m.context_length >= curated.minContextLength
      const isBlocked = curated.blockedProviders.some((p) =>
        m.id.toLowerCase().includes(p),
      )
      return isFree && hasContext && !isBlocked
    })

    // Find highest-priority curated model that is currently free & available
    const availableIds = new Set(freeModels.map((m) => m.id))
    const sorted = [...curated.preferredModels].sort((a, b) => a.priority - b.priority)
    const best = sorted.find((m) => availableIds.has(m.id))

    if (!best) {
      console.warn('[model-discovery] No preferred models currently available for free')
      return existing
    }

    const modelMeta = freeModels.find((m) => m.id === best.id)!

    const selected: SelectedModel = {
      modelId: best.id,
      modelName: best.name,
      contextLength: modelMeta.context_length,
      discoveredAt: new Date().toISOString(),
    }

    fs.mkdirSync(path.dirname(SELECTED_MODEL_PATH), { recursive: true })
    fs.writeFileSync(SELECTED_MODEL_PATH, JSON.stringify(selected, null, 2))

    console.log(`[model-discovery] Selected fallback model: ${best.name}`)
    return selected
  } catch (err) {
    console.error('[model-discovery] Failed:', err)
    return existing
  }
}

export async function getAvailableFreeModels(): Promise<DiscoveredModel[]> {
  if (!process.env.OPENROUTER_API_KEY) return []

  try {
    const curated = JSON.parse(
      fs.readFileSync(CURATED_MODELS_PATH, 'utf-8'),
    ) as CuratedConfig

    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    })

    if (!res.ok) return []

    const data = (await res.json()) as { data: OpenRouterModel[] }

    return data.data
      .filter((m) => {
        const isFree = m.pricing.prompt === '0' && m.pricing.completion === '0'
        const hasContext = m.context_length >= curated.minContextLength
        const isBlocked = curated.blockedProviders.some((p) =>
          m.id.toLowerCase().includes(p),
        )
        return isFree && hasContext && !isBlocked
      })
      .map((m) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length,
        provider: m.id.split('/')[0] ?? m.id,
        isFree: true,
      }))
  } catch {
    return []
  }
}
