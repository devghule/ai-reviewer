import { execSync } from 'node:child_process'

import type { ChangedFile } from './types'

export function getChangedFiles(
  repositoryPath: string,
  targetBranch: string,
): ChangedFile[] {
  const output = execSync(
    `git diff --name-status ${targetBranch}...HEAD`,
    {
      cwd: repositoryPath,
      encoding: 'utf-8',
    },
  )

  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, path] = line.split('\t')

      const extension = path.includes('.')
        ? path.split('.').pop() || ''
        : ''

      return {
        path,
        extension,
        status,
      }
    })
}