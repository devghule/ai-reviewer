import { NextRequest } from 'next/server'
import { readContext, writeContext } from '@/lib/context/loader'
import { generateContextFromRepo } from '@/lib/context/generator'
import { getRepo } from '@/lib/config'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string }> },
) {
  const { repo } = await params
  const content = readContext(repo)

  return Response.json({ repo, content, exists: content !== null })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ repo: string }> },
) {
  const { repo } = await params
  const { content } = (await req.json()) as { content: string }

  if (typeof content !== 'string') {
    return Response.json({ error: 'content must be a string' }, { status: 400 })
  }

  writeContext(repo, content)
  return Response.json({ success: true })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string }> },
) {
  const { repo } = await params

  let repoConfig
  try {
    repoConfig = getRepo(repo)
  } catch {
    return Response.json({ error: `Repo "${repo}" not configured` }, { status: 404 })
  }

  try {
    const content = await generateContextFromRepo(repo, repoConfig.path)
    return Response.json({ success: true, content })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 },
    )
  }
}
