import { generateWithFallback } from '@/lib/ai/fallback'
import { writeContext } from './loader'

const GENERATION_PROMPT = (repoName: string, fileTree: string) => `
You are a software architect. Analyze this repository and generate a concise architecture summary.

Repository: ${repoName}
File structure:
${fileTree}

Generate a markdown summary covering:
1. Architecture Overview (how the system is structured)
2. Key Modules (main directories and their purpose)
3. DTOs / Data Contracts (if visible from file names)
4. API Endpoints (if detectable)
5. Business Rules (any domain rules visible in naming)
6. Cross-repo Dependencies (what other systems this likely depends on)
7. Known Patterns (design patterns, frameworks used)

Keep it factual and concise. This will be used as context for future code reviews.
Write in plain markdown with clear headings.
`.trim()

export async function generateContextFromRepo(
  repoName: string,
  repoPath: string,
): Promise<string> {
  const fileTree = await buildFileTree(repoPath)
  const prompt = GENERATION_PROMPT(repoName, fileTree)

  const content = await generateWithFallback(prompt)

  // The generator prompt returns markdown, not JSON — save as-is
  writeContext(repoName, content)
  return content
}

async function buildFileTree(repoPath: string): Promise<string> {
  const { execSync } = await import('node:child_process')

  try {
    // git ls-files gives only tracked files, which is clean and relevant
    const result = execSync('git ls-files', {
      cwd: repoPath,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 2,
    })

    const lines = result
      .trim()
      .split('\n')
      .filter(Boolean)
      // Exclude lock files, build artifacts, images
      .filter(
        (f) =>
          !f.match(
            /\.(lock|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
          ) &&
          !f.includes('node_modules') &&
          !f.includes('.next') &&
          !f.includes('dist/') &&
          !f.includes('build/'),
      )
      .slice(0, 500) // cap at 500 files to stay within token limits

    return lines.join('\n')
  } catch {
    return '(could not read file tree)'
  }
}
