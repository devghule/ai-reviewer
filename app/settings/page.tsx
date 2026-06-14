'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, Save } from 'lucide-react'
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

interface Settings {
  retentionDays: number
}

export default function SettingsPage() {
  const [models, setModels] = useState<ModelInfo | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [retention, setRetention] = useState<number>(14)
  const [savingRetention, setSavingRetention] = useState(false)

  function fetchModels() {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: ModelInfo) => setModels(data))
      .catch(() => {})
  }

  function fetchSettings() {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data)
        setRetention(data.retentionDays)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchModels()
    fetchSettings()
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

  async function saveRetention() {
    const val = Number(retention)
    if (!Number.isInteger(val) || val < 1 || val > 90) {
      toast.error('Retention must be 1–90 days')
      return
    }
    setSavingRetention(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: val }),
      })
      if (!res.ok) throw new Error()
      const updated: Settings = await res.json()
      setSettings(updated)
      setRetention(updated.retentionDays)
      toast.success('Retention updated')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSavingRetention(false)
    }
  }

  const retentionChanged = settings !== null && retention !== settings.retentionDays

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

      {/* Review retention */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Storage
        </h2>
        <div className="p-4 rounded-lg border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Review retention</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reviews older than this are automatically deleted on startup.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={90}
                value={retention}
                onChange={(e) => setRetention(Number(e.target.value))}
                className="w-20 h-8 text-sm text-center rounded-md border bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">days</span>
              {retentionChanged && (
                <Button
                  size="sm"
                  onClick={saveRetention}
                  disabled={savingRetention}
                  className="h-8"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {savingRetention ? 'Saving…' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Config notes */}
      <section>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Configuration Files
        </h2>
        <div className="space-y-2 text-sm">
          <ConfigNote
            label="repos.json"
            value="config/repos.json"
            note="Your repo paths (gitignored — not committed)"
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
    <div className="flex items-start justify-between p-3 rounded-md border gap-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <code className="text-xs bg-muted px-2 py-1 rounded shrink-0">{value}</code>
    </div>
  )
}
