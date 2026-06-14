import { randomUUID } from 'node:crypto'
import type { ReviewFinding, ReviewMode, ReviewReport, ReviewProgressEvent } from '@/types'
import { getChangedFiles, getCurrentBranch } from '@/lib/git'
import { buildPrompt } from '@/lib/prompts/builder'
import { generateWithFallback } from '@/lib/ai/fallback'
import { parseAIResponse } from './parser'
import { detectCrossRepoImpact } from './cross-repo-detector'
import { writeReview } from '@/lib/storage/write'

const BATCH_DIFF_LINE_THRESHOLD = 100 // files under this get batched
const MAX_BATCH_SIZE = 5
const MAX_DIFF_LINES = 500 // truncate individual files beyond this

export async function runReviewPipeline(opts: {
  repoName: string
  repoPath: string
  targetBranch: string
  mode: ReviewMode
  onProgress?: (event: ReviewProgressEvent) => void
}): Promise<ReviewReport> {
  const { repoName, repoPath, targetBranch, mode, onProgress } = opts
  const startTime = Date.now()

  const emit = (event: ReviewProgressEvent) => onProgress?.(event)

  const branch = await getCurrentBranch(repoPath)
  const files = await getChangedFiles(repoPath, targetBranch)

  emit({ type: 'start', totalFiles: files.length, repo: repoName, mode })

  // Cross-repo detection runs before review
  const crossRepoResult = detectCrossRepoImpact(files)
  if (crossRepoResult.detected) {
    emit({ type: 'cross-repo-hint', affectedRepos: ['webapp', 'android'].filter((r) => r !== repoName) })
  }

  // Separate files into small (batchable) and large (individual)
  const smallFiles = files.filter(
    (f) => f.diff.split('\n').length < BATCH_DIFF_LINE_THRESHOLD && f.status !== 'deleted',
  )
  const largeFiles = files.filter(
    (f) => f.diff.split('\n').length >= BATCH_DIFF_LINE_THRESHOLD && f.status !== 'deleted',
  )

  const allFindings: ReviewFinding[] = []
  let fileIndex = 0

  // Process large files individually
  for (const file of largeFiles) {
    fileIndex++
    emit({ type: 'file', current: fileIndex, total: files.length, file: file.path })

    const diff = truncateDiff(file.diff)
    const prompt = buildPrompt({
      mode,
      repoName,
      filePath: file.path,
      diff,
      includeAllContext: mode === 'cross-repo' || mode === 'detailed',
    })

    try {
      const raw = await generateWithFallback(prompt)
      const findings = parseAIResponse(raw)
      allFindings.push(...findings)
    } catch (err) {
      console.error(`[pipeline] Failed to review ${file.path}:`, err)
    }
  }

  // Process small files in batches
  for (let i = 0; i < smallFiles.length; i += MAX_BATCH_SIZE) {
    const batch = smallFiles.slice(i, i + MAX_BATCH_SIZE)
    fileIndex += batch.length

    const batchLabel = batch.map((f) => f.path).join(', ')
    emit({ type: 'file', current: fileIndex, total: files.length, file: batchLabel })

    const combinedDiff = batch
      .map((f) => `// File: ${f.path}\n${f.diff}`)
      .join('\n\n')

    const prompt = buildPrompt({
      mode,
      repoName,
      filePath: batch.map((f) => f.path).join(', '),
      diff: combinedDiff,
      includeAllContext: mode === 'cross-repo' || mode === 'detailed',
    })

    try {
      const raw = await generateWithFallback(prompt)
      const findings = parseAIResponse(raw)
      allFindings.push(...findings)
    } catch (err) {
      console.error(`[pipeline] Failed to review batch:`, err)
    }
  }

  const summary = {
    critical: allFindings.filter((f) => f.severity === 'critical').length,
    high: allFindings.filter((f) => f.severity === 'high').length,
    medium: allFindings.filter((f) => f.severity === 'medium').length,
    low: allFindings.filter((f) => f.severity === 'low').length,
    total: allFindings.length,
  }

  const report: ReviewReport = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    repo: repoName,
    branch,
    targetBranch,
    reviewMode: mode,
    summary,
    findings: allFindings,
    crossRepoImpactDetected: crossRepoResult.detected,
    durationMs: Date.now() - startTime,
  }

  await writeReview(report)

  emit({ type: 'complete', reportId: report.id })

  return report
}

function truncateDiff(diff: string): string {
  const lines = diff.split('\n')
  if (lines.length <= MAX_DIFF_LINES) return diff

  const truncated = lines.slice(0, MAX_DIFF_LINES)
  truncated.push(`\n... [diff truncated at ${MAX_DIFF_LINES} lines, ${lines.length - MAX_DIFF_LINES} lines omitted]`)
  return truncated.join('\n')
}
