'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  GitBranch, FileCode, Zap, Search, GitPullRequest,
  Building2, TrendingUp, AlignLeft, AlertTriangle, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressIndicator } from '@/components/progress-indicator'
import { cn } from '@/lib/utils'
import type { ReviewMode, ReviewProgressEvent } from '@/types'

interface RepoInfo {
  name: string
  path: string
  targetBranch: string
  currentBranch: string | null
  isValid: boolean
  changedFilesCount: number | null
}

const REVIEW_MODES: Array<{
  mode: ReviewMode
  label: string
  icon: React.ElementType
  description: string
  // seconds per file (used to compute dynamic estimate)
  secsPerFile: number
}> = [
  { mode: 'quick',        label: 'Quick',        icon: Zap,            description: 'Null handling, obvious bugs',  secsPerFile: 4  },
  { mode: 'deep',         label: 'Deep',         icon: Search,         description: 'Full pre-PR review',           secsPerFile: 10 },
  { mode: 'cross-repo',   label: 'Cross-Repo',   icon: GitPullRequest, description: 'DTO & API drift detection',    secsPerFile: 12 },
  { mode: 'architecture', label: 'Architecture', icon: Building2,      description: 'Layering & coupling analysis', secsPerFile: 10 },
  { mode: 'optimization', label: 'Optimization', icon: TrendingUp,     description: 'Performance & scalability',    secsPerFile: 10 },
  { mode: 'detailed',     label: 'Detailed',     icon: AlignLeft,      description: 'Maximum depth — everything',   secsPerFile: 18 },
]

const REPO_COLORS: Record<string, string> = {
  backend: 'border-violet-400 bg-violet-50 dark:bg-violet-950/30',
  webapp:  'border-sky-400 bg-sky-50 dark:bg-sky-950/30',
  android: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
}
const REPO_ICON_COLORS: Record<string, string> = {
  backend: 'text-violet-500',
  webapp:  'text-sky-500',
  android: 'text-emerald-500',
}

function estimateTime(fileCount: number | null, secsPerFile: number): string {
  if (fileCount === null) return '~?'
  const batches = Math.max(1, Math.ceil(fileCount / 5))
  const totalSecs = batches * secsPerFile
  if (totalSecs < 60) return `~${totalSecs}s`
  const mins = Math.round(totalSecs / 60)
  return `~${mins} min`
}

export default function HomePage() {
  const router = useRouter()
  const [repos, setRepos] = useState<RepoInfo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [selectedMode, setSelectedMode] = useState<ReviewMode>('deep')
  const [reviewing, setReviewing] = useState(false)
  const [progress, setProgress] = useState<ReviewProgressEvent | null>(null)
  const [crossRepoHint, setCrossRepoHint] = useState<string[] | null>(null)
  const abortRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    fetch('/api/repos')
      .then((r) => r.json())
      .then((data: RepoInfo[]) => {
        setRepos(data)
        const first = data.find((r) => r.isValid)
        if (first) setSelectedRepo(first.name)
      })
      .catch(() => {})
  }, [])

  const repoInfo = repos.find((r) => r.name === selectedRepo)
  const modeInfo = REVIEW_MODES.find((m) => m.mode === selectedMode)
  const timeEstimate = modeInfo
    ? estimateTime(repoInfo?.changedFilesCount ?? null, modeInfo.secsPerFile)
    : '~?'

  async function startReview() {
    if (!selectedRepo || reviewing) return
    setReviewing(true)
    setProgress(null)
    setCrossRepoHint(null)

    let cancelled = false
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
    abortRef.current = () => { cancelled = true; reader?.cancel() }

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

    reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (!cancelled) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          const event = JSON.parse(part.slice(6)) as ReviewProgressEvent
          setProgress(event)
          if (event.type === 'cross-repo-hint') setCrossRepoHint(event.affectedRepos)
          if (event.type === 'complete') { router.push(`/results/${event.reportId}`); return }
          if (event.type === 'error') { setReviewing(false); return }
        }
      }
    } catch {
      if (!cancelled) setProgress({ type: 'error', message: 'Connection lost during review' })
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Code Review</h1>
          <p className="text-muted-foreground mt-1.5">
            Select a repository and review mode to get started.
          </p>
        </div>

        {/* Repos */}
        <section className="mb-8">
          <Label>Repository</Label>
          <div className="grid grid-cols-2 gap-3">
            {repos.map((repo) => {
              const active = selectedRepo === repo.name
              const colorClass = REPO_COLORS[repo.name] ?? 'border-border'
              const iconColor = REPO_ICON_COLORS[repo.name] ?? 'text-muted-foreground'
              return (
                <button
                  key={repo.name}
                  onClick={() => repo.isValid && setSelectedRepo(repo.name)}
                  disabled={!repo.isValid}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left transition-all duration-150',
                    active ? colorClass + ' shadow-sm' : 'border-border hover:border-muted-foreground/40 bg-card',
                    !repo.isValid && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  {active && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className={cn('w-4 h-4', iconColor)} />
                    <span className="text-sm font-semibold capitalize">{repo.name}</span>
                    {repo.changedFilesCount !== null && (
                      <span className="ml-auto text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {repo.changedFilesCount} file{repo.changedFilesCount !== 1 ? 's' : ''} changed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      <span className="font-mono truncate">{repo.currentBranch ?? 'unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-3">
                      <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                      <span className="font-mono">{repo.targetBranch}</span>
                    </div>
                  </div>
                </button>
              )
            })}
            {repos.length === 0 && (
              <div className="col-span-2 p-6 rounded-xl border-2 border-dashed text-center text-sm text-muted-foreground">
                <FileCode className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No repos configured.
                <br />
                Copy <code className="text-xs bg-muted px-1 rounded">config/repos.example.json</code> → <code className="text-xs bg-muted px-1 rounded">config/repos.json</code>
              </div>
            )}
          </div>
        </section>

        {/* Review modes */}
        <section className="mb-8">
          <Label>Review Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {REVIEW_MODES.map(({ mode, label, icon: Icon, description, secsPerFile }) => {
              const active = selectedMode === mode
              const t = estimateTime(repoInfo?.changedFilesCount ?? null, secsPerFile)
              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'p-3.5 rounded-xl border-2 text-left transition-all duration-150',
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-muted-foreground/40 bg-card',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn('w-4 h-4', active ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-[10px] text-muted-foreground font-mono">{t}</span>
                  </div>
                  <p className={cn('text-sm font-semibold mb-0.5', active && 'text-primary')}>{label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Cross-repo hint */}
        {crossRepoHint && crossRepoHint.length > 0 && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">Cross-repo impact likely</p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                DTO, enum, or API changes detected. Consider running Cross-Repo review to check impact on{' '}
                <strong>{crossRepoHint.join(', ')}</strong>.
              </p>
              <button
                onClick={() => setSelectedMode('cross-repo')}
                className="text-xs text-orange-700 dark:text-orange-300 underline mt-1 hover:no-underline"
              >
                Switch to Cross-Repo Review
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="mb-5">
            <ProgressIndicator event={progress} />
          </div>
        )}

        {/* CTA */}
        <Button
          size="lg"
          onClick={startReview}
          disabled={!selectedRepo || reviewing}
          className="w-full h-12 text-base font-semibold shadow-sm"
        >
          {reviewing ? 'Reviewing…' : `Start ${modeInfo?.label ?? ''} Review`}
          {!reviewing && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>

        {repoInfo && !reviewing && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            Comparing{' '}
            <span className="font-mono">{repoInfo.currentBranch ?? 'HEAD'}</span>{' '}
            against{' '}
            <span className="font-mono">{repoInfo.targetBranch}</span>
            {repoInfo.changedFilesCount !== null && (
              <> · {repoInfo.changedFilesCount} changed file{repoInfo.changedFilesCount !== 1 ? 's' : ''}</>
            )}
            {' '}· {timeEstimate}
          </p>
        )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  )
}
