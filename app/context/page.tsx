'use client'

import { useEffect, useState } from 'react'
import { BookOpen, RefreshCw, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

interface ContextInfo {
  repo: string
  content: string | null
  exists: boolean
}

const REPO_NAMES = ['backend', 'webapp', 'android']

export default function ContextPage() {
  const [contexts, setContexts] = useState<Record<string, ContextInfo>>({})
  const [activeRepo, setActiveRepo] = useState(REPO_NAMES[0]!)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  function fetchContext(repo: string) {
    fetch(`/api/context/${repo}`)
      .then((r) => r.json())
      .then((data: ContextInfo) => {
        setContexts((prev) => ({ ...prev, [repo]: data }))
      })
      .catch(() => {})
  }

  useEffect(() => {
    REPO_NAMES.forEach(fetchContext)
  }, [])

  const current = contexts[activeRepo]

  function startEdit() {
    setDraft(current?.content ?? '')
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await fetch(`/api/context/${activeRepo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      })
      toast.success('Context saved')
      fetchContext(activeRepo)
      setEditing(false)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function generateContext() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/context/${activeRepo}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Context generated')
      fetchContext(activeRepo)
      setEditing(false)
    } catch {
      toast.error('Generation failed — make sure the repo is configured in repos.json')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Context Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Architecture summaries injected into every review prompt.
        </p>
      </div>

      {/* Repo tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {REPO_NAMES.map((repo) => (
          <button
            key={repo}
            onClick={() => {
              setActiveRepo(repo)
              setEditing(false)
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeRepo === repo
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {repo}
            {contexts[repo]?.exists && (
              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        {!editing ? (
          <>
            <Button variant="outline" size="sm" onClick={startEdit}>
              <BookOpen className="w-4 h-4 mr-2" />
              {current?.exists ? 'Edit' : 'Create manually'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateContext}
              disabled={generating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generating…' : 'Auto-generate from repo'}
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={saveEdit} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full h-[60vh] p-4 rounded-lg border font-mono text-sm resize-none bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Write the architecture summary for this repo in markdown…"
        />
      ) : current?.exists && current.content ? (
        <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg border bg-muted/20">
          <ReactMarkdown>{current.content}</ReactMarkdown>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground text-sm">
          No context for <strong>{activeRepo}</strong> yet.
          <br />
          Auto-generate from the repo or write it manually.
        </div>
      )}
    </div>
  )
}
