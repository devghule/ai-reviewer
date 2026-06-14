import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'

const SETTINGS_PATH = path.join(process.cwd(), 'config', 'settings.json')

const SettingsSchema = z.object({
  retentionDays: z.number().int().min(1).max(90).default(14),
})

export type Settings = z.infer<typeof SettingsSchema>

const DEFAULTS: Settings = { retentionDays: 14 }

export function readSettings(): Settings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return DEFAULTS
    const raw = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
    const parsed = SettingsSchema.safeParse(raw)
    return parsed.success ? parsed.data : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function writeSettings(settings: Partial<Settings>): Settings {
  const current = readSettings()
  const merged = { ...current, ...settings }
  const validated = SettingsSchema.parse(merged)
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true })
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(validated, null, 2), 'utf-8')
  return validated
}
