import fs from 'node:fs'
import path from 'node:path'
import type { ReviewMode } from '@/types'

const PROMPT_DIR = path.join(process.cwd(), 'prompts')
const CONTEXT_DIR = path.join(process.cwd(), 'contexts')

const MODE_TO_FILE: Record<ReviewMode, string> = {
  quick: 'quick-review.md',
  deep: 'deep-review.md',
  'cross-repo': 'crossrepo-review.md',
  architecture: 'architecture-review.md',
  optimization: 'optimization-review.md',
  detailed: 'detailed-review.md',
}

export function loadPromptTemplate(mode: ReviewMode): string {
  const file = path.join(PROMPT_DIR, MODE_TO_FILE[mode])
  return fs.readFileSync(file, 'utf-8')
}

export function loadContextSummary(repoName: string): string {
  const file = path.join(CONTEXT_DIR, `${repoName}-summary.md`)
  if (!fs.existsSync(file)) return ''
  return fs.readFileSync(file, 'utf-8')
}

export function loadAllContextSummaries(): Record<string, string> {
  const summaries: Record<string, string> = {}
  if (!fs.existsSync(CONTEXT_DIR)) return summaries

  for (const file of fs.readdirSync(CONTEXT_DIR)) {
    if (!file.endsWith('-summary.md')) continue
    const repoName = file.replace('-summary.md', '')
    summaries[repoName] = fs.readFileSync(path.join(CONTEXT_DIR, file), 'utf-8')
  }

  return summaries
}

export function buildPrompt(opts: {
  mode: ReviewMode
  repoName: string
  filePath: string
  diff: string
  includeAllContext?: boolean
}): string {
  const template = loadPromptTemplate(opts.mode)

  const repoContext = loadContextSummary(opts.repoName)
  const allContext = opts.includeAllContext ? loadAllContextSummaries() : {}

  const contextBlock = buildContextBlock(opts.repoName, repoContext, allContext)

  return [
    template,
    '',
    contextBlock,
    '',
    `## File under review`,
    `\`${opts.filePath}\``,
    '',
    '## Git diff',
    '```diff',
    opts.diff,
    '```',
  ]
    .join('\n')
    .trim()
}

function buildContextBlock(
  currentRepo: string,
  repoContext: string,
  allContext: Record<string, string>,
): string {
  const parts: string[] = []

  if (repoContext) {
    parts.push(`## Repository context: ${currentRepo}`)
    parts.push(repoContext)
  }

  const otherRepos = Object.entries(allContext).filter(
    ([name]) => name !== currentRepo,
  )

  if (otherRepos.length > 0) {
    parts.push('## Cross-repo context')
    for (const [name, summary] of otherRepos) {
      parts.push(`### ${name}`)
      parts.push(summary)
    }
  }

  return parts.join('\n\n')
}
