export type ReviewIssue = {
  severity: 'low' | 'medium' | 'high'
  category: string
  message: string
  suggestion?: string
}

export type FileReview = {
  file: string
  issues: ReviewIssue[]
}

export type ReviewReport = {
  repository: string
  branch: string
  targetBranch: string
  summary: string
  reviews: FileReview[]
  generatedAt: string
}