import { basename, dirname, resolve as resolvePath } from 'node:path'
import process from 'node:process'
import { spawn } from 'cross-spawn'

const gitTimestampCache = new Map<string, Promise<number>>()

/** Clear cached Git timestamps for a specific file or all files. */
export function clearGitTimestampCache(file?: string) {
  if (!file) {
    gitTimestampCache.clear()
    return
  }
  const filePath = resolvePath(file)
  const prefixCreated = `created:${filePath}:`
  const prefixUpdated = `updated:${filePath}:`
  for (const key of gitTimestampCache.keys()) {
    if (key.startsWith(prefixCreated) || key.startsWith(prefixUpdated))
      gitTimestampCache.delete(key)
  }
}

/** Read commit timestamps from the file's repository, following renames. */
export function getGitTimestamp(file: string, type: 'created' | 'updated' = 'updated') {
  const filePath = resolvePath(file)
  const cacheKey = `${type}:${filePath}:${process.env.PATH ?? ''}`
  const cached = gitTimestampCache.get(cacheKey)
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

  gitTimestampCache.set(cacheKey, pending)
  return pending
}
