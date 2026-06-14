import { loadRepos } from '@/lib/config'
import { getCurrentBranch, validateRepo } from '@/lib/git'
import simpleGit from 'simple-git'

export async function GET() {
  try {
    const repos = loadRepos()

    const enriched = await Promise.all(
      repos.map(async (repo) => {
        const valid = await validateRepo(repo.path)
        let branch: string | null = null
        let changedFilesCount: number | null = null

        if (valid) {
          try {
            branch = await getCurrentBranch(repo.path)
            const git = simpleGit(repo.path)
            const raw = await git.raw(['diff', '--name-only', `${repo.targetBranch}...HEAD`])
            changedFilesCount = raw.trim() ? raw.trim().split('\n').length : 0
          } catch {
            // repo valid but diff failed — branch might not exist yet
          }
        }

        return { ...repo, currentBranch: branch, isValid: valid, changedFilesCount }
      }),
    )

    return Response.json(enriched)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load repos' },
      { status: 500 },
    )
  }
}
