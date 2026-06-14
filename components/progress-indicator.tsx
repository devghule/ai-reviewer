import { Loader2, FileCode, CheckCircle, AlertCircle } from 'lucide-react'
import type { ReviewProgressEvent } from '@/types'

interface ProgressIndicatorProps {
  event: ReviewProgressEvent | null
}

export function ProgressIndicator({ event }: ProgressIndicatorProps) {
  if (!event) return null

  if (event.type === 'start') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium">Starting review…</p>
          <p className="text-xs text-muted-foreground">
            {event.totalFiles} file{event.totalFiles !== 1 ? 's' : ''} to review
          </p>
        </div>
      </div>
    )
  }

  if (event.type === 'file') {
    const pct = Math.round((event.current / event.total) * 100)
    return (
      <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Reviewing file {event.current} of {event.total}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FileCode className="w-3 h-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground truncate">{event.file}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  if (event.type === 'complete') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          Review complete
        </p>
      </div>
    )
  }

  if (event.type === 'error') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200">Review failed</p>
          <p className="text-xs text-red-700 dark:text-red-300">{event.message}</p>
        </div>
      </div>
    )
  }

  return null
}
