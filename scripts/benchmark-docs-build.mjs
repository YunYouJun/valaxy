import { execFileSync, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Both worktrees must have frozen dependencies installed and core packages built.
// Only the candidate's disposable TypeDoc cache is cleared; source files stay intact.
const [baselinePath, reportPath, count = '3'] = process.argv.slice(2)
if (!baselinePath || !reportPath || !Number.isInteger(Number(count)) || Number(count) < 3)
  throw new Error('Usage: node scripts/benchmark-docs-build.mjs <baseline-worktree> <reports> [runs >= 3]')
const candidate = await realpath(process.cwd())
const baseline = await realpath(baselinePath)
if (candidate === baseline)
  throw new Error('The baseline must be a separate worktree of the pre-migration revision.')
const directory = resolve(reportPath)
const measure = resolve(dirname(fileURLToPath(import.meta.url)), 'measure-docs-build.mjs')
await mkdir(directory, { recursive: true })

function revision(cwd) {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim()
}
async function inputKey(cwd) {
  const hash = createHash('sha256').update(revision(cwd))
  hash.update(execFileSync('git', ['diff', 'HEAD', '--binary'], { cwd, maxBuffer: 32 * 1024 * 1024 }))
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { cwd, encoding: 'utf8' }).split('\0').filter(Boolean).sort()
  for (const file of untracked)
    hash.update(file).update(await readFile(resolve(cwd, file)))
  return hash.digest('hex')
}
const revisions = { baseline: revision(baseline), candidate: revision(candidate) }
const inputs = { baseline: await inputKey(baseline), candidate: await inputKey(candidate) }

async function run(cwd, name, script, round) {
  const output = resolve(directory, String(round), name)
  console.log(`Round ${round}: ${name}`)
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, [measure, output, script], { cwd, stdio: 'inherit' })
    child.once('error', reject)
    child.once('close', code => code === 0 ? accept() : reject(new Error(`${name} failed (${code}); see ${output}`)))
  })
  return JSON.parse(await readFile(resolve(output, `${script.replaceAll(':', '-')}.json`), 'utf8'))
}

const rounds = []
for (let round = 1; round <= Number(count); round++) {
  const result = { round }
  const original = async () => {
    result.docs = await run(baseline, 'original-docs', 'docs:build', round)
    result.api = await run(baseline, 'original-api', 'api:build', round)
  }
  const merged = async () => {
    await rm(resolve(candidate, 'docs/.valaxy/content/typedoc--api-/cache.json'), { force: true })
    result.cold = await run(candidate, 'merged-cold', 'docs:build', round)
    result.warm = await run(candidate, 'merged-warm', 'docs:build', round)
    const coldLog = await readFile(resolve(directory, String(round), 'merged-cold/docs-build.log'), 'utf8')
    const warmLog = await readFile(resolve(directory, String(round), 'merged-warm/docs-build.log'), 'utf8')
    if (!coldLog.includes('[typedoc] Generated') || warmLog.includes('[typedoc] Generated'))
      throw new Error('Expected TypeDoc generation in the cold build and a cache hit in the warm build.')
  }
  // Alternate order to limit bias from warming and a drifting host load.
  if (round % 2) {
    await original()
    await merged()
  }
  else {
    await merged()
    await original()
  }
  rounds.push(result)
  await writeFile(resolve(directory, 'rounds.json'), `${JSON.stringify(rounds, null, 2)}\n`)
  if (await inputKey(baseline) !== inputs.baseline || await inputKey(candidate) !== inputs.candidate)
    throw new Error('Source files changed during the benchmark; repeat with stable worktrees.')
}

function stats(values) {
  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return { median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2, min: sorted[0], max: sorted.at(-1) }
}
const summary = {
  baseline,
  candidate,
  revisions,
  inputs,
  runs: rounds.length,
  originalSequentialSeconds: stats(rounds.map(r => r.docs.elapsedSeconds + r.api.elapsedSeconds)),
  // Estimate only: the original builds are measured sequentially, not concurrently.
  estimatedOriginalParallelCriticalPathSeconds: stats(rounds.map(r => Math.max(r.docs.elapsedSeconds, r.api.elapsedSeconds))),
  coldSeconds: stats(rounds.map(r => r.cold.elapsedSeconds)),
  warmSeconds: stats(rounds.map(r => r.warm.elapsedSeconds)),
  originalPeakRssMiB: Math.max(...rounds.flatMap(r => [r.docs.peakProcessTreeRssMiB, r.api.peakProcessTreeRssMiB])),
  mergedPeakRssMiB: Math.max(...rounds.flatMap(r => [r.cold.peakProcessTreeRssMiB, r.warm.peakProcessTreeRssMiB])),
  memorySamplingComplete: rounds.every(r => [r.docs, r.api, r.cold, r.warm].every(v => v.samples > 0)),
}
summary.coldRatio = summary.coldSeconds.median / summary.originalSequentialSeconds.median
await writeFile(resolve(directory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
console.log(JSON.stringify(summary, null, 2))

// Optional, explicit CI budgets. Local measurements remain useful without them.
const maxRatio = Number(process.env.DOCS_MAX_COLD_RATIO)
const maxRss = Number(process.env.DOCS_MAX_RSS_MIB)
for (const name of ['DOCS_MAX_COLD_RATIO', 'DOCS_MAX_RSS_MIB']) {
  if (process.env[name] && !(Number(process.env[name]) > 0))
    throw new Error(`${name} must be a positive number.`)
}
if ((maxRatio > 0 && summary.coldRatio > maxRatio)
  || (maxRss > 0 && (!summary.memorySamplingComplete || summary.mergedPeakRssMiB > maxRss))) {
  console.error('Documentation build exceeded the configured budget; inspect the reports before release.')
  process.exitCode = 1
}
