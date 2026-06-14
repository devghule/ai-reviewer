import fs from 'node:fs'
import path from 'node:path'

const CONTEXT_DIR = path.join(process.cwd(), 'contexts')

export function getContextPath(repoName: string): string {
  return path.join(CONTEXT_DIR, `${repoName}-summary.md`)
}

export function readContext(repoName: string): string | null {
  const filePath = getContextPath(repoName)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf-8')
}

export function writeContext(repoName: string, content: string): void {
  fs.mkdirSync(CONTEXT_DIR, { recursive: true })
  fs.writeFileSync(getContextPath(repoName), content, 'utf-8')
}

export function listContexts(): Array<{
  repo: string
  lastModified: string
  size: number
}> {
  if (!fs.existsSync(CONTEXT_DIR)) return []

  return fs
    .readdirSync(CONTEXT_DIR)
    .filter((f) => f.endsWith('-summary.md'))
    .map((file) => {
      const stat = fs.statSync(path.join(CONTEXT_DIR, file))
      return {
        repo: file.replace('-summary.md', ''),
        lastModified: stat.mtime.toISOString(),
        size: stat.size,
      }
    })
}
