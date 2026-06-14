'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface ModelInfo {
  selected: {
    modelId: string
    modelName: string
    contextLength: number
    discoveredAt: string
  } | null
  available: Array<{
    id: string
    name: string
    contextLength: number
    provider: string
  }>
}

export default function SettingsPage() {
  const [models, setModels] = useState<ModelInfo | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  function fetchModels() {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: ModelInfo) => setModels(data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchModels()
  }, [])

  async function refreshModels() {
    setRefreshing(true)
    try {
      await fetch('/api/models', { method: 'POST' })
      toast.success('Model discovery complete')
      fetchModels()
    } catch {
      toast.error('Discovery failed')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI provider configuration and model management.
        </p>
      </div>

      {/* Primary model */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Primary Provider
        </h2>
        <div className="p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Gemini 2.5 Pro</p>
              <p className="text-xs text-muted-foreground">
                google/gemini-2.5-pro · Configure via GEMINI_API_KEY in .env.local
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fallback model */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Fallback Model (OpenRouter Free)
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshModels}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {models?.selected ? (
          <div className="p-4 rounded-lg border mb-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">{models.selected.modelName}</p>
                <p className="text-xs text-muted-foreground">
                  {models.selected.modelId} ·{' '}
                  {(models.selected.contextLength / 1000).toFixed(0)}k context
                </p>
                <p className="text-xs text-muted-foreground">
                  Last checked{' '}
                  {new Date(models.selected.discoveredAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed text-sm text-muted-foreground mb-3">
            No fallback model selected yet. Click Refresh to discover available free models.
          </div>
        )}

        {/* Available models */}
        {models?.available && models.available.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {models.available.length} free models available (non-China, ≥32k context)
            </p>
            <div className="space-y-1.5">
              {models.available.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-md border text-sm"
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.id}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {(m.contextLength / 1000).toFixed(0)}k
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Config notes */}
      <section>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Configuration
        </h2>
        <div className="space-y-3 text-sm">
          <ConfigNote
            label="repos.json"
            value="config/repos.json (gitignored)"
            note="Add your repo paths here"
          />
          <ConfigNote
            label="GEMINI_API_KEY"
            value=".env.local"
            note="Required — get from aistudio.google.com"
          />
          <ConfigNote
            label="OPENROUTER_API_KEY"
            value=".env.local"
            note="Required for fallback — get from openrouter.ai"
          />
          <ConfigNote
            label="Review retention"
            value="14 days"
            note="Reviews older than 14 days are deleted on startup"
          />
        </div>
      </section>
    </div>
  )
}

function ConfigNote({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex items-start justify-between p-3 rounded-md border">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>
    </div>
  )
}
