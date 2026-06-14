import { getSelectedModel, getAvailableFreeModels, runModelDiscovery } from '@/lib/ai/model-discovery'

export async function GET() {
  const selected = await getSelectedModel()
  const available = await getAvailableFreeModels()

  return Response.json({ selected, available })
}

export async function POST() {
  const selected = await runModelDiscovery()
  return Response.json({ selected })
}
