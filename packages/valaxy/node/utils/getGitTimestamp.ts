import { spawn } from 'cross-spawn'

export function getGitTimestamp(file: string, type: 'created' | 'updated' = 'updated') {
  return new Promise<number>((resolve, _reject) => {
    const params = ['log']
    if (type === 'updated')
      params.push('-1')
    params.push('--pretty="%ci"', file)
    if (type === 'created')
      params.push('|', 'tail', '-1')

    const child = spawn('xxx', params)
    let output = ''
    child.stdout.on('data', d => (output += String(d)))
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', () => { resolve(0) })
  })
}
