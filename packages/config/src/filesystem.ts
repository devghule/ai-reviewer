import fs from 'node:fs'

export function ensureDirectoryExists(
  directoryPath: string,
) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, {
      recursive: true,
    })
  }
}