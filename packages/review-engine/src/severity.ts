export function calculateSeverity(
  issue: string,
) {
  const normalized =
    issue.toLowerCase()

  if (
    normalized.includes('security') ||
    normalized.includes('password') ||
    normalized.includes('vulnerability')
  ) {
    return 'high'
  }

  if (
    normalized.includes('performance') ||
    normalized.includes('memory')
  ) {
    return 'medium'
  }

  return 'low'
}