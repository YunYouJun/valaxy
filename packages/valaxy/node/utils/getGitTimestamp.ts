import { spawn } from 'cross-spawn'

export function getGitTimestamp(file: string, type: 'created' | 'updated' = 'updated') {
  return new Promise<number>((resolve, _reject) => {
    const params = ['log']
    if (type === 'updated')
      params.push('-1')
    params.push('--pretty="%ci"', file)

    const child = spawn('git', params)
    let output = ''
    child.stdout.on('data', d => (output += String(d)))
    child.on('close', () => {
      // `spawn` does not run a shell, so the oldest commit cannot be picked by
      // piping the log into `tail -1`. Pick it from the output instead.
      const timestamps = output.trim().split('\n').filter(Boolean)
      const timestamp = type === 'created' ? timestamps[timestamps.length - 1] : timestamps[0]
      resolve(+new Date(timestamp || ''))
    })
    child.on('error', () => {
      resolve(0)
    })
  })
}
