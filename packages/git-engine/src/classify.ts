export function classifyFile(
  filePath: string,
) {
  const normalized =
    filePath.toLowerCase()

  if (normalized.includes('controller'))
    return 'controller'

  if (normalized.includes('service'))
    return 'service'

  if (normalized.includes('dto'))
    return 'dto'

  if (normalized.includes('repository'))
    return 'repository'

  if (
    normalized.endsWith('.tsx') ||
    normalized.endsWith('.jsx')
  )
    return 'ui-component'

  if (
    normalized.endsWith('.ts') ||
    normalized.endsWith('.js')
  )
    return 'typescript'

  return 'unknown'
}