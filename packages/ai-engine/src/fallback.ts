export async function withFallback(
  providers: (() => Promise<string>)[],
) {
  let lastError: unknown

  for (const provider of providers) {
    try {
      return await provider()
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}