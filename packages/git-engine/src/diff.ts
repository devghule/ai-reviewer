import { execSync } from 'node:child_process'

export function generateDiff(
  repositoryPath: string,
  targetBranch: string,
) {
  const diff = execSync(
    `git diff ${targetBranch}...HEAD`,
    {
      cwd: repositoryPath,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10,
    },
  )

  return diff
}