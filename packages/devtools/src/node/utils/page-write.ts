import { readFile, realpath, writeFile } from 'node:fs/promises'

const pendingWrites = new Map<string, Promise<unknown>>()

/** Serialize editor writes to avoid losing a concurrent body or metadata save. */
export async function updatePageFile<T>(file: string, update: (raw: string) => { content: string, result: T }): Promise<T> {
  const canonical = await realpath(file)
  const previous = pendingWrites.get(canonical) || Promise.resolve()
  const operation = previous.catch(() => {}).then(async () => {
    const { content, result } = update(await readFile(canonical, 'utf8'))
    await writeFile(canonical, content, 'utf8')
    return result
  })
  pendingWrites.set(canonical, operation)
  try {
    return await operation
  }
  finally {
    if (pendingWrites.get(canonical) === operation)
      pendingWrites.delete(canonical)
  }
}
