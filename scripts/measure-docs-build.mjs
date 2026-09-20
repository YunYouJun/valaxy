import { execFileSync, spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'

// Usage: node scripts/measure-docs-build.mjs <report-directory> <pnpm-script>
const [directory, script] = process.argv.slice(2)
if (!directory || !script)
  throw new Error('Usage: node scripts/measure-docs-build.mjs <report-directory> <pnpm-script>')

await mkdir(directory, { recursive: true })
const output = createWriteStream(resolve(directory, `${script.replaceAll(':', '-')}.log`))
const started = performance.now()
const startLoad = os.loadavg()
const child = spawn('pnpm', ['run', script], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, VALAXY_BUILD_PROFILE: '1' } })
const phases = []
let pending = ''
child.stdout.on('data', (chunk) => {
  pending += chunk.toString()
  const lines = pending.split('\n')
  pending = lines.pop()
  for (const line of lines) {
    if (line.startsWith('[valaxy:build] '))
      phases.push(JSON.parse(line.slice('[valaxy:build] '.length)))
  }
})
child.stdout.pipe(output, { end: false })
child.stderr.pipe(output, { end: false })
let peakRssKiB = 0
let samples = 0
const timer = setInterval(() => {
  try {
    const rows = execFileSync('ps', ['-axo', 'pid=,ppid=,rss='], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .map(row => row.trim().split(/\s+/).map(Number))
    const descendants = new Set([child.pid])
    let previous = -1
    while (previous !== descendants.size) {
      previous = descendants.size
      for (const [pid, parent] of rows) {
        if (descendants.has(parent))
          descendants.add(pid)
      }
    }
    peakRssKiB = Math.max(peakRssKiB, rows.reduce((sum, [pid, , rss]) => sum + (descendants.has(pid) ? rss : 0), 0))
    samples++
  }
  catch { /* ps may be unavailable; report sample count rather than fake a measurement. */ }
}, 500)
const code = await new Promise((accept, reject) => {
  child.once('error', reject)
  child.once('close', accept)
}).finally(() => clearInterval(timer))
output.end()
const report = { script, node: process.version, platform: process.platform, arch: process.arch, cpuCount: os.cpus().length, totalMemoryMiB: os.totalmem() / 1024 / 1024, loadAverage: { start: startLoad, end: os.loadavg() }, nodeOptions: process.env.NODE_OPTIONS || '', elapsedSeconds: (performance.now() - started) / 1000, peakProcessTreeRssMiB: samples ? peakRssKiB / 1024 : null, samples, exitCode: code, phases }
await writeFile(resolve(directory, `${script.replaceAll(':', '-')}.json`), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report))
process.exitCode = code ?? 1
