'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  GitBranch,
  FileCode,
  Zap,
  Search,
  GitPullRequest,
  Building2,
  TrendingUp,
  AlignLeft,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressIndicator } from '@/components/progress-indicator'
import type { ReviewMode, ReviewProgressEvent } from '@/types'

interface RepoInfo {
  name: string
  path: string
  targetBranch: string
  currentBranch: string | null
  isValid: boolean
}

const REVIEW_MODES: Array<{ mode: ReviewMode; label: string; icon: React.ElementType; description: string }> = [
  { mode: 'quick', label: 'Quick', icon: Zap, description: 'Fast sanity check' },
  { mode: 'deep', label: 'Deep', icon: Search, description: 'Pre-PR full review' },
  { mode: 'cross-repo', label: 'Cross-Repo', icon: GitPullRequest, description: 'DTO & API drift' },
  { mode: 'architecture', label: 'Architecture', icon: Building2, description: 'Structural review' },
  { mode: 'optimization', label: 'Optimization', icon: TrendingUp, description: 'Performance & scale' },
  { mode: 'detailed', label: 'Detailed', icon: AlignLeft, description: 'Full comprehensive' },
]

export default function HomePage() {
  const router = useRouter()
  const [repos, setRepos] = useState<RepoInfo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [selectedMode, setSelectedMode] = useState<ReviewMode>('deep')
  const [reviewing, setReviewing] = useState(false)
  const [progress, setProgress] = useState<ReviewProgressEvent | null>(null)
  const [crossRepoHint, setCrossRepoHint] = useState<string[] | null>(null)
  const eventSourceRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    fetch('/api/repos')
      .then((r) => r.json())
      .then((data: RepoInfo[]) => {
        setRepos(data)
        if (data.length > 0 && data[0]) setSelectedRepo(data[0].name)
      })
      .catch(() => {})
  }, [])

  const selectedRepoInfo = repos.find((r) => r.name === selectedRepo)

  async function startReview() {
    if (!selectedRepo || reviewing) return

    setReviewing(true)
    setProgress(null)
    setCrossRepoHint(null)

    const response = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: selectedRepo, mode: selectedMode }),
    })

    if (!response.ok || !response.body) {
      setProgress({ type: 'error', message: 'Failed to start review' })
      setReviewing(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const cleanup = () => {
      reader.cancel()
      setReviewing(false)
    }
    eventSourceRef.current = cleanup

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6)) as ReviewProgressEvent
          setProgress(event)

          if (event.type === 'cross-repo-hint') {
            setCrossRepoHint(event.affectedRepos)
          }

          if (event.type === 'complete') {
            setReviewing(false)
            router.push(`/results/${event.reportId}`)
            return
          }

          if (event.type === 'error') {
            setReviewing(false)
            return
          }
        }
      }
    } catch {
      setProgress({ type: 'error', message: 'Connection lost during review' })
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Code Review</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a repository and review mode, then start the review.
        </p>
      </div>

      {/* Repo selector */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Repository
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {repos.map((repo) => (
            <button
              key={repo.name}
              onClick={() => setSelectedRepo(repo.name)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedRepo === repo.name
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${!repo.isValid ? 'opacity-50' : ''}`}
              disabled={!repo.isValid}
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{repo.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {repo.currentBranch ?? 'unknown branch'}
              </p>
              <p className="text-xs text-muted-foreground">
                → {repo.targetBranch}
              </p>
            </button>
          ))}
          {repos.length === 0 && (
            <div className="col-span-3 p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
              No repos configured. Copy{' '}
              <code className="text-xs">config/repos.example.json</code> to{' '}
              <code className="text-xs">config/repos.json</code>.
            </div>
          )}
        </div>
      </section>

      {/* Changed files preview */}
      {selectedRepoInfo && (
        <section className="mb-6">
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Comparing{' '}
              <code className="text-xs bg-muted px-1 rounded">
                {selectedRepoInfo.currentBranch ?? 'HEAD'}
              </code>{' '}
              →{' '}
              <code className="text-xs bg-muted px-1 rounded">
                {selectedRepoInfo.targetBranch}
              </code>
            </span>
          </div>
        </section>
      )}

      {/* Review mode */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Review Mode
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {REVIEW_MODES.map(({ mode, label, icon: Icon, description }) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedMode === mode
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Cross-repo hint */}
      {crossRepoHint && crossRepoHint.length > 0 && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Cross-repo impact likely
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
              DTO or API changes detected. Consider running a Cross-Repo review to check impact on{' '}
              {crossRepoHint.join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="mb-4">
          <ProgressIndicator event={progress} />
        </div>
      )}

      {/* Start button */}
      <Button
        size="lg"
        onClick={startReview}
        disabled={!selectedRepo || reviewing}
        className="w-full"
      >
        {reviewing ? 'Reviewing…' : `Start ${REVIEW_MODES.find((m) => m.mode === selectedMode)?.label} Review`}
      </Button>
    </div>
  )
}
