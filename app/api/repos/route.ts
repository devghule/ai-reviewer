import { loadRepos } from '@/lib/config'
import { getCurrentBranch, validateRepo } from '@/lib/git'

export async function GET() {
  try {
    const repos = loadRepos()

    const enriched = await Promise.all(
      repos.map(async (repo) => {
        const valid = await validateRepo(repo.path)
        let branch = null

        if (valid) {
          try {
            branch = await getCurrentBranch(repo.path)
          } catch {
            branch = null
          }
        }

        return { ...repo, currentBranch: branch, isValid: valid }
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
