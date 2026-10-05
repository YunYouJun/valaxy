import { spawn } from 'node:child_process'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import process from 'node:process'
import { expect, it } from 'vitest'

function alive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  }
  catch {
    return false
  }
}

// Exercise the actual runner's signal handling without packing or installing.
// The stand-in command owns a descendant that refuses graceful termination.
it.each(['SIGINT', 'SIGTERM', 'timeout'] as const)('cleans up command trees after %s', async (signal, { skip }) => {
  // Windows has no POSIX signal delivery; its timeout still exercises the real
  // pnpm.cmd process tree through the same cleanup used after normal acceptance.
  if (process.platform === 'win32' && signal !== 'timeout')
    skip()
  const root = await mkdtemp(join(tmpdir(), 'valaxy-onboarding-cleanup-'))
  const marker = join(root, 'pids.json')
  const pnpm = join(root, 'pnpm')
  const descendant = join(root, 'descendant.cjs')
  const clock = join(root, 'clock.mjs')
  // Shorten only the ten-minute command deadline in this subprocess.
  await writeFile(clock, `
    const original = globalThis.setTimeout
    globalThis.setTimeout = (callback, ms, ...args) => original(callback, ms === 600_000 ? 2000 : ms, ...args)
  `)
  await writeFile(descendant, `
    process.on('SIGTERM', () => {})
    process.send('ready')
    setInterval(() => {}, 1000)
  `)
  await writeFile(pnpm, `#!/usr/bin/env node
    const { fork } = require('node:child_process')
    const { writeFileSync } = require('node:fs')
    const child = fork(${JSON.stringify(descendant)}, [], { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    child.once('message', () => writeFileSync(${JSON.stringify(marker)}, JSON.stringify([process.pid, child.pid])))
    setInterval(() => {}, 1000)
  `)
  await chmod(pnpm, 0o755)
  if (process.platform === 'win32')
    await writeFile(join(root, 'pnpm.cmd'), `@"${process.execPath}" "${pnpm}" %*\r\n`)
  const runner = spawn(process.execPath, [
    '--import',
    'tsx',
    ...signal === 'timeout' ? ['--import', clock] : [],
    resolve('scripts/check-onboarding.ts'),
  ], {
    env: { ...process.env, PATH: `${root}${delimiter}${process.env.PATH}`, VALAXY_ONBOARDING_ARTIFACTS: root },
    stdio: 'ignore',
  })
  let pids: number[] = []
  const done = new Promise<number | null>(resolve => runner.once('exit', resolve))
  try {
    await expect.poll(() => readFile(marker, 'utf8').then(JSON.parse).catch(() => []), { timeout: 10_000 }).toHaveLength(2)
    pids = JSON.parse(await readFile(marker, 'utf8'))
    expect(pids.every(alive)).toBe(true)
    if (signal !== 'timeout')
      runner.kill(signal)
    await expect.poll(() => pids.some(alive), { timeout: 10_000 }).toBe(false)
    expect(await done).toBe(signal === 'timeout' ? 1 : signal === 'SIGINT' ? 130 : 143)
    expect(JSON.parse(await readFile(join(root, 'record.json'), 'utf8')).passed).toBe(false)
  }
  finally {
    runner.kill('SIGKILL')
    for (const pid of pids) {
      if (alive(pid))
        process.kill(pid, 'SIGKILL')
    }
    // The runner intentionally retains real acceptance projects; remove this
    // empty interrupted fixture when a record was successfully written.
    const record = await readFile(join(root, 'record.json'), 'utf8').then(JSON.parse).catch(() => undefined)
    if (record?.root)
      await rm(record.root, { recursive: true, force: true })
    await rm(root, { recursive: true, force: true })
  }
}, 25_000)
