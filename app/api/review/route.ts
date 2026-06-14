import { NextRequest } from 'next/server'
import { z } from 'zod'
import { REVIEW_MODES } from '@/types'
import type { ReviewProgressEvent } from '@/types'
import { runReviewPipeline } from '@/lib/review/pipeline'
import { getRepo } from '@/lib/config'
import { runModelDiscovery } from '@/lib/ai/model-discovery'
import { runCleanup } from '@/lib/storage/cleanup'

const RequestSchema = z.object({
  repo: z.string().min(1),
  mode: z.enum(REVIEW_MODES),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { repo: repoName, mode } = parsed.data

  let repoConfig
  try {
    repoConfig = getRepo(repoName)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 404 },
    )
  }

  // Run startup jobs (non-blocking)
  void runModelDiscovery()
  void runCleanup()

  // SSE stream for progress
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ReviewProgressEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        )
      }

      try {
        await runReviewPipeline({
          repoName,
          repoPath: repoConfig.path,
          targetBranch: repoConfig.targetBranch,
          mode,
          onProgress: send,
        })
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'Review failed',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
