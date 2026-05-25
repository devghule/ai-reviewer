import fs from 'node:fs'

export function validateRepositoryPath(
  repositoryPath: string,
) {
  if (!fs.existsSync(repositoryPath)) {
    throw new Error(
      `Repository path does not exist: ${repositoryPath}`,
    )
  }

  const gitPath = `${repositoryPath}/.git`

  if (!fs.existsSync(gitPath)) {
    throw new Error(
      `Not a valid git repository: ${repositoryPath}`,
    )
  }

  return true
}