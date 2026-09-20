import { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmod, cp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { readWorkspaceOverrides } from './workspace-overrides'

const exec = promisify(execFile)
const destination = resolve('resources')
const version = '24.18.0'
const isWindows = process.platform === 'win32'
const platform = `${isWindows ? 'win' : process.platform}-${process.arch}`
const archiveName = `node-v${version}-${platform}.${isWindows ? 'zip' : 'tar.gz'}`
const base = `https://nodejs.org/dist/v${version}/`
const unpacked = join(destination, `node-v${version}-${platform}`)

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Download failed: ${response.status} ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

await mkdir(destination, { recursive: true })
const sums = (await download(`${base}SHASUMS256.txt`)).toString()
const expected = sums.split('\n').find(line => line.endsWith(`  ${archiveName}`))?.split(' ')[0]
if (!expected)
  throw new Error(`Unsupported runtime platform: ${platform}`)
const archive = join(destination, archiveName)
let data: Buffer | undefined = await readFile(archive).catch(() => undefined)
if (!data || createHash('sha256').update(data).digest('hex') !== expected) {
  data = await download(`${base}${archiveName}`)
  if (createHash('sha256').update(data).digest('hex') !== expected)
    throw new Error('Node.js archive checksum mismatch')
  await writeFile(archive, data)
}
await exec('tar', ['-xf', archive, '-C', destination])
await mkdir(join(destination, 'runtime'), { recursive: true })
await cp(join(unpacked, isWindows ? 'node.exe' : 'bin/node'), join(destination, 'runtime', isWindows ? 'node.exe' : 'node'))
await cp(join(unpacked, 'LICENSE'), join(destination, 'runtime', 'LICENSE'))
if (!isWindows)
  await chmod(join(destination, 'runtime/node'), 0o755)
await rm(unpacked, { recursive: true, force: true })
await rm(archive)

const pnpmRoot = await realpath(resolve('node_modules/pnpm'))
const pnpmExecutable = join(pnpmRoot, isWindows ? 'pnpm.exe' : 'pnpm')
await rm(join(destination, 'pnpm'), { recursive: true, force: true })
await cp(pnpmRoot, join(destination, 'pnpm'), { recursive: true, dereference: true })
const packages: Record<string, string> = {}
await rm(join(destination, 'packages'), { recursive: true, force: true })
await mkdir(join(destination, 'packages'), { recursive: true })
for (const directory of ['@valaxyjs/utils', 'devtools', 'valaxy', 'valaxy-addon-girls', 'valaxy-theme-yun']) {
  const root = resolve('..', directory)
  const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  const filename = `${manifest.name.replace('@', '').replace('/', '-')}.tgz`
  await exec(pnpmExecutable, ['-C', root, 'pack', '--out', join(destination, 'packages', filename)])
  packages[manifest.name] = filename
}
await writeFile(join(destination, 'packages.json'), JSON.stringify(packages, null, 2))
// Keep generated blogs on the dependency overrides validated by this repository.
const overrides = await readWorkspaceOverrides(resolve('../../pnpm-workspace.yaml'))
await writeFile(join(destination, 'framework-overrides.json'), JSON.stringify(overrides, null, 2))
await writeFile(join(destination, 'runtime.json'), JSON.stringify({ node: version, platform, sha256: expected }, null, 2))
const cloudflare = join(destination, 'cloudflare')
await mkdir(cloudflare, { recursive: true })
await writeFile(join(cloudflare, 'package.json'), JSON.stringify({ private: true, dependencies: { wrangler: '4.135.0' } }))
await writeFile(join(cloudflare, 'pnpm-workspace.yaml'), 'packages: []\nnodeLinker: hoisted\n')
await exec(pnpmExecutable, ['install', '--dir', cloudflare, '--ignore-workspace', '--ignore-scripts', '--config.pm-on-fail=ignore'], { maxBuffer: 10_000_000 })
console.log(`Prepared verified Node ${version}, pnpm, and ${Object.keys(packages).length} local packages for ${platform}.`)
