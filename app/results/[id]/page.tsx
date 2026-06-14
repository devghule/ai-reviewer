'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Clock, GitBranch, CheckCircle } from 'lucide-react'
import { FindingCard } from '@/components/finding-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReviewReport, Category } from '@/types'

const CATEGORY_ORDER: Category[] = [
  'Critical', 'Architecture', 'CrossRepo', 'Performance',
  'EdgeCase', 'Maintainability', 'FutureProofing', 'Learning',
]

const CATEGORY_LABELS: Record<Category, string> = {
  Critical: 'Critical Issues',
  Architecture: 'Architecture',
  CrossRepo: 'Cross-Repo Impact',
  Performance: 'Performance',
  EdgeCase: 'Edge Cases',
  Maintainability: 'Maintainability',
  FutureProofing: 'Future-Proofing',
  Learning: 'Engineering Insights',
}

const SEVERITY_BAR: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
  low: 'bg-blue-400',
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [report, setReport] = useState<ReviewReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')

  useEffect(() => {
    fetch(`/api/reviews/${id}`)
      .then((r) => r.json())
      .then((data: ReviewReport) => { setReport(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="-ml-2 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <p className="text-muted-foreground text-sm">Review not found.</p>
      </div>
    )
  }

  const byCategory = CATEGORY_ORDER.reduce<Record<Category, typeof report.findings>>(
    (acc, cat) => { acc[cat] = report.findings.filter((f) => f.category === cat); return acc },
    {} as Record<Category, typeof report.findings>,
  )
  const activeCategories = CATEGORY_ORDER.filter((c) => (byCategory[c]?.length ?? 0) > 0)
  const filteredFindings = activeCategory === 'all'
    ? report.findings
    : report.findings.filter((f) => f.category === activeCategory)

  const durationSec = (report.durationMs / 1000).toFixed(1)
  const hasIssues = report.summary.total > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-3xl mx-auto p-8">

        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to reviews
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight capitalize">
                {report.repo} — {report.reviewMode} review
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="font-mono">{report.branch}</span>
                  <span>→</span>
                  <span className="font-mono">{report.targetBranch}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {durationSec}s
                </span>
                <span>{new Date(report.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <div key={sev} className={cn(
              'p-4 rounded-xl border-2 text-center',
              report.summary[sev] > 0 ? 'bg-card' : 'bg-muted/30 border-border/50',
            )}>
              <div className={cn('w-8 h-1.5 rounded-full mx-auto mb-2', SEVERITY_BAR[sev])} />
              <p className={cn('text-3xl font-bold tabular-nums', report.summary[sev] === 0 && 'text-muted-foreground')}>
                {report.summary[sev]}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{sev}</p>
            </div>
          ))}
        </div>

        {/* Cross-repo alert */}
        {report.crossRepoImpactDetected && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">Cross-repo impact detected</p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                DTO, enum, or API changes found. Run a Cross-Repo review to verify impact on other repositories.
              </p>
            </div>
          </div>
        )}

        {/* No findings */}
        {!hasIssues ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-lg">Looks good</p>
            <p className="text-sm text-muted-foreground mt-1">No high-confidence issues found above threshold.</p>
          </div>
        ) : (
          <>
            {/* Category filter tabs */}
            {activeCategories.length > 1 && (
              <div className="flex gap-1.5 flex-wrap mb-6">
                <FilterTab active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
                  All ({report.summary.total})
                </FilterTab>
                {activeCategories.map((cat) => (
                  <FilterTab key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                    {CATEGORY_LABELS[cat]} ({byCategory[cat]?.length})
                  </FilterTab>
                ))}
              </div>
            )}

            {/* Findings */}
            {activeCategory === 'all' ? (
              CATEGORY_ORDER.filter((cat) => (byCategory[cat]?.length ?? 0) > 0).map((cat) => (
                <section key={cat} className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-bold">{CATEGORY_LABELS[cat]}</h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {byCategory[cat]?.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {byCategory[cat]?.map((f) => (
                      <FindingCard key={f.id} finding={f} defaultOpen={f.severity === 'critical'} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="space-y-2">
                {filteredFindings.map((f) => (
                  <FindingCard key={f.id} finding={f} defaultOpen={f.severity === 'critical'} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
      )}
    >
      {children}
    </button>
  )
}
