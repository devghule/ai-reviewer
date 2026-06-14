'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, ChevronRight, GitBranch, History, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReviewReport } from '@/types'
import toast from 'react-hot-toast'

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
  low: 'bg-blue-400',
}

export default function HistoryPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewReport[]>([])
  const [filterRepo, setFilterRepo] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [loading, setLoading] = useState(true)

  function fetchReviews() {
    const params = new URLSearchParams()
    if (filterRepo) params.set('repo', filterRepo)
    if (filterMode) params.set('mode', filterMode)
    fetch(`/api/reviews?${params}`)
      .then((r) => r.json())
      .then((data: ReviewReport[]) => { setReviews(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [filterRepo, filterMode])

  async function deleteReview(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
    toast.success('Review deleted')
    fetchReviews()
  }

  const repos = [...new Set(reviews.map((r) => r.repo))]
  const modes = [...new Set(reviews.map((r) => r.reviewMode))]

  const topSeverity = (r: ReviewReport) => {
    if (r.summary.critical > 0) return 'critical'
    if (r.summary.high > 0) return 'high'
    if (r.summary.medium > 0) return 'medium'
    if (r.summary.low > 0) return 'low'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Review History</h1>
          <p className="text-muted-foreground text-sm mt-1">Reviews from the last 14 days</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <select
            value={filterRepo}
            onChange={(e) => setFilterRepo(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All repos</option>
            {repos.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All modes</option>
            {modes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center">
            <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Run your first review from the home screen
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/')}>
              Start a review
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => {
              const sev = topSeverity(review)
              return (
                <div
                  key={review.id}
                  onClick={() => router.push(`/results/${review.id}`)}
                  className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                >
                  {/* Severity dot */}
                  <div className={cn(
                    'w-2 h-10 rounded-full shrink-0',
                    sev ? SEVERITY_DOT[sev] : 'bg-muted',
                  )} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold capitalize">{review.repo}</span>
                      <Badge variant="outline" className="text-[11px] capitalize">{review.reviewMode}</Badge>
                      {review.crossRepoImpactDetected && (
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        <span className="font-mono">{review.branch}</span>
                      </span>
                      <span>{review.summary.total} findings</span>
                      <span>{formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Severity counts */}
                  <div className="hidden sm:flex items-center gap-2 text-xs shrink-0">
                    {review.summary.critical > 0 && <Pill label={review.summary.critical} color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" />}
                    {review.summary.high > 0 && <Pill label={review.summary.high} color="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200" />}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 w-7 h-7"
                      onClick={(e) => deleteReview(e, review.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Pill({ label, color }: { label: number; color: string }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full font-semibold tabular-nums', color)}>
      {label}
    </span>
  )
}
