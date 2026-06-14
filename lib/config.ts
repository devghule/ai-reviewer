import fs from 'node:fs'
import path from 'node:path'
import { ReposFileSchema } from '@/types'
import type { RepoConfig } from '@/types'

const REPOS_PATH = path.join(process.cwd(), 'config', 'repos.json')

export function loadRepos(): RepoConfig[] {
  if (!fs.existsSync(REPOS_PATH)) {
    throw new Error(
      'config/repos.json not found. Copy config/repos.example.json to config/repos.json and fill in your repo paths.',
    )
  }

  const raw = fs.readFileSync(REPOS_PATH, 'utf-8')
  const parsed = ReposFileSchema.safeParse(JSON.parse(raw))

  if (!parsed.success) {
    throw new Error(`Invalid repos.json: ${JSON.stringify(parsed.error.flatten())}`)
  }

  return parsed.data.repos
}

export function getRepo(name: string): RepoConfig {
  const repos = loadRepos()
  const repo = repos.find((r) => r.name === name)
  if (!repo) throw new Error(`Repo "${name}" not found in config/repos.json`)
  return repo
}
