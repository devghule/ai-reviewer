import fs from 'node:fs'
import path from 'node:path'

import {
  RepositoryCollectionSchema,
  type RepositoryCollection,
} from '@repo/schemas'

const REPO_CONFIG_PATH = path.resolve(
  process.cwd(),
  'configs/repos.json',
)

export function loadRepositoryConfig(): RepositoryCollection {
  if (!fs.existsSync(REPO_CONFIG_PATH)) {
    throw new Error(
      `Repository config not found at: ${REPO_CONFIG_PATH}`,
    )
  }

  const rawConfig = fs.readFileSync(
    REPO_CONFIG_PATH,
    'utf-8',
  )

  const parsedJson = JSON.parse(rawConfig)

  return RepositoryCollectionSchema.parse(parsedJson)
}