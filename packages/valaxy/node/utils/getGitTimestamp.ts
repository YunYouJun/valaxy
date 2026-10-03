import { basename, dirname, resolve as resolvePath } from 'node:path'
import { spawn } from 'cross-spawn'

/** Read commit timestamps from the file's repository, following renames. */
export function getGitTimestamp(file: string, type: 'created' | 'updated' = 'updated') {
  const filePath = resolvePath(file)
  return new Promise<number>((resolve) => {
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
}
