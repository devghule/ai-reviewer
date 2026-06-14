import { useState } from 'react'
import { ChevronDown, ChevronRight, FileCode, Lightbulb } from 'lucide-react'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import type { ReviewFinding, Severity } from '@/types'

const SEVERITY_VARIANT: Record<Severity, 'critical' | 'high' | 'medium' | 'low'> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
}

interface FindingCardProps {
  finding: ReviewFinding
  defaultOpen?: boolean
}

export function FindingCard({ finding, defaultOpen = false }: FindingCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={SEVERITY_VARIANT[finding.severity]}>
              {finding.severity}
            </Badge>
            <Badge variant="outline">{finding.category}</Badge>
            <span className="text-sm font-medium">{finding.title}</span>
          </div>
          {!open && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {finding.description}
            </p>
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t bg-muted/20">
          <Section label="Description" text={finding.description} />
          <Section label="Impact" text={finding.impact} />
          <Section label="Recommendation" text={finding.recommendation} highlight />

          {finding.learning && (
            <div className="flex gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Engineering Insight
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{finding.learning}</p>
              </div>
            </div>
          )}

          {finding.affectedFiles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Affected files</p>
              <div className="space-y-1">
                {finding.affectedFiles.map((f) => (
                  <div key={f} className="flex items-center gap-1.5">
                    <FileCode className="w-3 h-3 text-muted-foreground shrink-0" />
                    <code className="text-xs">{f}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({
  label,
  text,
  highlight,
}: {
  label: string
  text: string
  highlight?: boolean
}) {
  return (
    <div className={cn('pt-3', highlight && 'rounded-md')}>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-sm', highlight && 'text-primary font-medium')}>{text}</p>
    </div>
  )
}
