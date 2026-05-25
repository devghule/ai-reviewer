export type ChangedFile = {
  path: string
  extension: string
  status: string
}

export type GitDiffResult = {
  repository: string
  branch: string
  targetBranch: string
  diff: string
  changedFiles: ChangedFile[]
}