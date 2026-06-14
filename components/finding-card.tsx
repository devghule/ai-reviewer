'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, FileCode, Lightbulb, AlertTriangle } from 'lucide-react'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import type { ReviewFinding, Severity } from '@/types'

const SEVERITY_STYLES: Record<Severity, { border: string; badge: 'critical' | 'high' | 'medium' | 'low'; bg: string }> = {
  critical: { border: 'border-l-red-500',   badge: 'critical', bg: 'hover:bg-red-50/50 dark:hover:bg-red-950/20' },
  high:     { border: 'border-l-orange-500', badge: 'high',     bg: 'hover:bg-orange-50/50 dark:hover:bg-orange-950/20' },
  medium:   { border: 'border-l-yellow-500', badge: 'medium',   bg: 'hover:bg-yellow-50/30 dark:hover:bg-yellow-950/20' },
  low:      { border: 'border-l-blue-500',   badge: 'low',      bg: 'hover:bg-blue-50/30 dark:hover:bg-blue-950/20' },
}

interface FindingCardProps {
  finding: ReviewFinding
  defaultOpen?: boolean
}

export function FindingCard({ finding, defaultOpen = false }: FindingCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const style = SEVERITY_STYLES[finding.severity]

  return (
    <div className={cn('border rounded-xl overflow-hidden border-l-4 transition-shadow', style.border, open && 'shadow-sm')}>
      <button
        onClick={() => setOpen(!open)}
        className={cn('w-full flex items-start gap-3 p-4 text-left transition-colors', style.bg)}
      >
        <span className="mt-0.5 text-muted-foreground shrink-0">
          {open
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={style.badge}>{finding.severity}</Badge>
            <Badge variant="outline" className="text-[11px]">{finding.category}</Badge>
          </div>
          <p className="text-sm font-semibold leading-snug">{finding.title}</p>
          {!open && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{finding.description}</p>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t bg-muted/10 divide-y divide-border/50">
          <FindingSection label="What's wrong" text={finding.description} />
          <FindingSection label="Impact" text={finding.impact} variant="warn" />
          <FindingSection label="Recommendation" text={finding.recommendation} variant="action" />

          {finding.learning && (
            <div className="px-5 py-4">
              <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Engineering Insight</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{finding.learning}</p>
                </div>
              </div>
            </div>
          )}

          {finding.affectedFiles.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Affected files</p>
              <div className="space-y-1.5">
                {finding.affectedFiles.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <code className="text-xs text-foreground/80 font-mono">{f}</code>
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

function FindingSection({
  label,
  text,
  variant,
}: {
  label: string
  text: string
  variant?: 'warn' | 'action'
}) {
  return (
    <div className="px-5 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        'text-sm leading-relaxed',
        variant === 'action' && 'text-primary font-medium',
        variant === 'warn' && 'text-foreground/80',
      )}>
        {text}
      </p>
    </div>
  )
}
