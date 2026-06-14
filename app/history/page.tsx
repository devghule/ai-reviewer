'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, ChevronRight, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ReviewReport } from '@/types'
import toast from 'react-hot-toast'

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
      .then((data: ReviewReport[]) => {
        setReviews(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchReviews()
  }, [filterRepo, filterMode])

  async function deleteReview(id: string) {
    await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
    toast.success('Review deleted')
    fetchReviews()
  }

  const repos = [...new Set(reviews.map((r) => r.repo))]
  const modes = [...new Set(reviews.map((r) => r.reviewMode))]

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Review History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Reviews from the last 14 days
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterRepo}
          onChange={(e) => setFilterRepo(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 bg-background"
        >
          <option value="">All repos</option>
          {repos.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 bg-background"
        >
          <option value="">All modes</option>
          {modes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="p-8 text-center border rounded-lg text-muted-foreground text-sm border-dashed">
          No reviews yet. Run your first review from the home screen.
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <button
                onClick={() => router.push(`/results/${review.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium capitalize">{review.repo}</span>
                  <Badge variant="outline" className="text-xs">
                    {review.reviewMode}
                  </Badge>
                  {review.summary.critical > 0 && (
                    <Badge variant="critical">{review.summary.critical} critical</Badge>
                  )}
                  {review.summary.high > 0 && !review.summary.critical && (
                    <Badge variant="high">{review.summary.high} high</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {review.branch}
                  </span>
                  <span>{review.summary.total} findings</span>
                  <span>
                    {formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 shrink-0"
                onClick={() => deleteReview(review.id)}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>

              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
