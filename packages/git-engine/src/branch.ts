import { execSync } from 'node:child_process'

export function getCurrentBranch(
  repositoryPath: string,
) {
  const branch = execSync(
    'git branch --show-current',
    {
      cwd: repositoryPath,
      encoding: 'utf-8',
    },
  )

  return branch.trim()
}