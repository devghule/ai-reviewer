export type ReviewComment = {
  file: string
  line?: number
  severity: 'low' | 'medium' | 'high'
  category: string
  message: string
  suggestion?: string
}

export type AIReviewResult = {
  provider: string
  model: string
  summary: string
  comments: ReviewComment[]
  raw: string
}