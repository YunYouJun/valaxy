import { basename, dirname, resolve as resolvePath } from 'node:path'
import process from 'node:process'
import { spawn } from 'cross-spawn'

const pipelineCaches = new WeakMap<object, Map<string, Promise<number>>>()

/** Return a pipeline-scoped Git timestamp cache keyed by an options/app object. */
export function getGitTimestampCache(scope: object): Map<string, Promise<number>> {
  let cache = pipelineCaches.get(scope)
  if (!cache) {
    cache = new Map()
    pipelineCaches.set(scope, cache)
  }
  return cache
}

/** Clear cached Git timestamps for a specific file or all files in a pipeline cache. */
export function clearGitTimestampCache(cache: Map<string, Promise<number>>, file?: string) {
  if (!file) {
    cache.clear()
    return
  }
  const filePath = resolvePath(file)
  const prefixCreated = `created:${filePath}:`
  const prefixUpdated = `updated:${filePath}:`
  for (const key of cache.keys()) {
    if (key.startsWith(prefixCreated) || key.startsWith(prefixUpdated))
      cache.delete(key)
  }
}

/** Read commit timestamps from the file's repository, following renames. */
export function getGitTimestamp(
  file: string,
  type: 'created' | 'updated' = 'updated',
  cache?: Map<string, Promise<number>>,
) {
  const filePath = resolvePath(file)
  const cacheKey = `${type}:${filePath}:${process.env.PATH ?? ''}`
  const cached = cache?.get(cacheKey)
  if (cached)
    return cached

  const pending = new Promise<number>((resolve) => {
    const params = ['--literal-pathspecs', 'log', '--follow', '--no-show-signature', '--format=%ct']
    if (type === 'updated')
      params.push('-1')
    params.push('--', basename(filePath))

    const child = spawn('git', params, { cwd: dirname(filePath) })
    let output = ''
    child.stdout.on('data', d => (output += String(d)))
    child.on('close', (code) => {
      if (code !== 0 || !output.trim()) {
        resolve(0)
        return
      }
      const timestamps = output.trim().split('\n')
      const timestamp = type === 'created' ? timestamps[timestamps.length - 1] : timestamps[0]
      // Git's Unix timestamp avoids locale-dependent Date parsing.
      const milliseconds = Number(timestamp) * 1000
      resolve(Number.isFinite(milliseconds) ? milliseconds : 0)
    })
    child.on('error', () => {
      resolve(0)
    })
  })

  cache?.set(cacheKey, pending)
  return pending
}
