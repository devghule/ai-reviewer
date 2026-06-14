import { z } from 'zod'

// ─── Enums ──────────────────────────────────────────────────────────────────

export const REVIEW_MODES = [
  'quick',
  'deep',
  'cross-repo',
  'architecture',
  'optimization',
  'detailed',
] as const

export type ReviewMode = (typeof REVIEW_MODES)[number]

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export type Severity = (typeof SEVERITIES)[number]

export const CATEGORIES = [
  'Critical',
  'Architecture',
  'CrossRepo',
  'Maintainability',
  'Performance',
  'EdgeCase',
  'FutureProofing',
  'Learning',
] as const

export type Category = (typeof CATEGORIES)[number]

// ─── Core finding ────────────────────────────────────────────────────────────

export const ReviewFindingSchema = z.object({
  id: z.string(),
  severity: z.enum(SEVERITIES),
  category: z.enum(CATEGORIES),
  title: z.string(),
  description: z.string(),
  impact: z.string(),
  recommendation: z.string(),
  learning: z.string().optional(),
  confidence: z.number().min(0).max(1),
  affectedFiles: z.array(z.string()),
})

export type ReviewFinding = z.infer<typeof ReviewFindingSchema>

// ─── Report ──────────────────────────────────────────────────────────────────

export const ReviewReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  repo: z.string(),
  branch: z.string(),
  targetBranch: z.string(),
  reviewMode: z.enum(REVIEW_MODES),
  summary: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    total: z.number(),
  }),
  findings: z.array(ReviewFindingSchema),
  crossRepoImpactDetected: z.boolean(),
  durationMs: z.number(),
})

export type ReviewReport = z.infer<typeof ReviewReportSchema>

// ─── Repo config ─────────────────────────────────────────────────────────────

export const RepoConfigSchema = z.object({
  name: z.string(),
  path: z.string(),
  targetBranch: z.string().default('dev'),
})

export type RepoConfig = z.infer<typeof RepoConfigSchema>

export const ReposFileSchema = z.object({
  repos: z.array(RepoConfigSchema),
})

// ─── AI provider ─────────────────────────────────────────────────────────────

export interface AIProvider {
  name: string
  generate: (prompt: string) => Promise<string>
}

// ─── Model discovery ─────────────────────────────────────────────────────────

export interface DiscoveredModel {
  id: string
  name: string
  contextLength: number
  provider: string
  isFree: boolean
}

export const SelectedModelSchema = z.object({
  modelId: z.string(),
  modelName: z.string(),
  contextLength: z.number(),
  discoveredAt: z.string(),
})

export type SelectedModel = z.infer<typeof SelectedModelSchema>

// ─── Review progress (SSE events) ────────────────────────────────────────────

export type ReviewProgressEvent =
  | { type: 'start'; totalFiles: number; repo: string; mode: ReviewMode }
  | { type: 'file'; current: number; total: number; file: string }
  | { type: 'complete'; reportId: string }
  | { type: 'error'; message: string }
  | { type: 'cross-repo-hint'; affectedRepos: string[] }

// ─── Changed file ────────────────────────────────────────────────────────────

export interface ChangedFile {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  diff: string
}
