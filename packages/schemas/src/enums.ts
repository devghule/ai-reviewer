export const REVIEW_SEVERITIES = [
  'critical',
  'high',
  'medium',
  'low',
] as const

export type ReviewSeverity =
  (typeof REVIEW_SEVERITIES)[number]

export const REVIEW_CATEGORIES = [
  'bug',
  'security',
  'performance',
  'architecture',
  'cross-repo',
  'maintainability',
  'reliability',
] as const

export type ReviewCategory =
  (typeof REVIEW_CATEGORIES)[number]

export const REVIEW_MODES = [
  'quick',
  'deep',
  'cross-repo',
  'architecture',
  'optimization',
] as const

export type ReviewMode =
  (typeof REVIEW_MODES)[number]