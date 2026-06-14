import simpleGit from 'simple-git'
import type { ChangedFile } from '@/types'

export async function getCurrentBranch(repoPath: string): Promise<string> {
  const git = simpleGit(repoPath)
  const branch = await git.revparse(['--abbrev-ref', 'HEAD'])
  return branch.trim()
}

export async function getChangedFiles(
  repoPath: string,
  targetBranch: string,
): Promise<ChangedFile[]> {
  const git = simpleGit(repoPath)

  const nameStatusRaw = await git.raw([
    'diff',
    '--name-status',
    `${targetBranch}...HEAD`,
  ])

  const lines = nameStatusRaw.trim().split('\n').filter(Boolean)
  const files: ChangedFile[] = []

  for (const line of lines) {
    const [statusCode, ...pathParts] = line.split('\t')
    const filePath = pathParts[pathParts.length - 1]
    if (!filePath) continue

    let status: ChangedFile['status'] = 'modified'
    if (statusCode === 'A') status = 'added'
    else if (statusCode === 'D') status = 'deleted'
    else if (statusCode?.startsWith('R')) status = 'renamed'

    const diff = await getFileDiff(repoPath, targetBranch, filePath, status)

    files.push({ path: filePath, status, diff })
  }

  return files
}

export async function getFileDiff(
  repoPath: string,
  targetBranch: string,
  filePath: string,
  status: ChangedFile['status'],
): Promise<string> {
  const git = simpleGit(repoPath)

  if (status === 'deleted') return ''

  try {
    const diff = await git.raw([
      'diff',
      `${targetBranch}...HEAD`,
      '--',
      filePath,
    ])
    return diff
  } catch {
    return ''
  }
}

export async function validateRepo(repoPath: string): Promise<boolean> {
  try {
    const git = simpleGit(repoPath)
    await git.revparse(['--git-dir'])
    return true
  } catch {
    return false
  }
}
