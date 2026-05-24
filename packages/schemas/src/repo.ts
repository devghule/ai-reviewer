import { z } from 'zod'

export const RepositoryConfigSchema = z.object({
  id: z.string(),

  displayName: z.string(),

  path: z.string(),

  targetBranch: z.string(),

  language: z.string(),

  framework: z.string(),

  relationships: z.array(z.string()),
})

export type RepositoryConfig =
  z.infer<typeof RepositoryConfigSchema>

export const RepositoryCollectionSchema = z.object({
  repos: z.array(RepositoryConfigSchema),
})

export type RepositoryCollection =
  z.infer<typeof RepositoryCollectionSchema>