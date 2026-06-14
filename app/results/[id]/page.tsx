'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  GitBranch,
} from 'lucide-react'
import { FindingCard } from '@/components/finding-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ReviewReport, Category } from '@/types'

const CATEGORY_ORDER: Category[] = [
  'Critical',
  'Architecture',
  'CrossRepo',
  'Performance',
  'EdgeCase',
  'Maintainability',
  'FutureProofing',
  'Learning',
]

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [report, setReport] = useState<ReviewReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews/${id}`)
      .then((r) => r.json())
      .then((data: ReviewReport) => {
        setReport(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground text-sm">Loading review…</div>
    )
  }

  if (!report) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground text-sm mb-4">Review not found.</p>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  const byCategory = CATEGORY_ORDER.reduce<Record<Category, typeof report.findings>>(
    (acc, cat) => {
      acc[cat] = report.findings.filter((f) => f.category === cat)
      return acc
    },
    {} as Record<Category, typeof report.findings>,
  )

  const durationSec = (report.durationMs / 1000).toFixed(1)

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold capitalize">{report.repo} — {report.reviewMode} review</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {report.branch} → {report.targetBranch}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {durationSec}s
              </span>
              <span>{new Date(report.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
          <div key={sev} className="p-4 rounded-lg border text-center">
            <p className="text-2xl font-bold">{report.summary[sev]}</p>
            <Badge variant={sev} className="mt-1">{sev}</Badge>
          </div>
        ))}
      </div>

      {/* Cross-repo hint */}
      {report.crossRepoImpactDetected && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Cross-repo impact detected
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
              This review found DTO, enum, or API changes. Run a Cross-Repo review to check impact on other repositories.
            </p>
          </div>
        </div>
      )}

      {/* Findings by category */}
      {report.findings.length === 0 ? (
        <div className="p-8 text-center border rounded-lg text-muted-foreground text-sm">
          No findings above confidence threshold. The code looks good.
        </div>
      ) : (
        CATEGORY_ORDER.filter((cat) => (byCategory[cat]?.length ?? 0) > 0).map((cat) => (
          <section key={cat} className="mb-8">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              {cat}
              <span className="text-xs text-muted-foreground font-normal">
                {byCategory[cat]?.length} finding{byCategory[cat]?.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <div className="space-y-2">
              {byCategory[cat]?.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  defaultOpen={finding.severity === 'critical'}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
