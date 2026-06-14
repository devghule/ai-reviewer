import { NextRequest } from 'next/server'
import { readSettings, writeSettings } from '@/lib/settings'

export async function GET() {
  return Response.json(readSettings())
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  try {
    const updated = writeSettings(body)
    return Response.json(updated)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Invalid settings' },
      { status: 400 },
    )
  }
}
