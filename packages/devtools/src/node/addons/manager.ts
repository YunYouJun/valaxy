import type { AddonInventory, AddonOperation, AddonOperationPlan, AddonPackageDetails, InstalledAddon } from '../../shared/addons'
import type { ValaxyDevtoolsOptions } from '../types'
import { createHash, randomUUID } from 'node:crypto'
import process from 'node:process'
import { addons, normalizeRepositoryUrl } from '@valaxyjs/utils'
import spawn from 'cross-spawn'
import fg from 'fast-glob'
import fs from 'fs-extra'
import pathe from 'pathe'
import { updatePageFile } from '../utils/page-write'
import { resolveInsideRoot } from '../utils/paths'
import { removeAddonFromConfig } from './config'

const configNames = ['valaxy.config.ts', 'valaxy.config.mts', 'valaxy.config.js', 'valaxy.config.mjs']
const dependencyFields = ['dependencies', 'devDependencies', 'optionalDependencies'] as const
const states = new Map<string, ManagerState>()
const busyWorkspaces = new Set<string>()

interface StoredPlan {
  plan: AddonOperationPlan
  revision: string
  expires: number
  args: string[]
}

interface ManagerState {
  plans: Map<string, StoredPlan>
  jobs: Map<string, AddonOperation>
  operation?: AddonOperation
}

interface ManagerDependencies {
  fetchPackage?: (name: string) => Promise<AddonPackageDetails>
  run?: (root: string, args: string[], onLog: (text: string) => void) => Promise<void>
}

function assertAddonName(name: string) {
  if (!/^valaxy-addon-[a-z0-9][a-z0-9._-]*$/.test(name) || name.length > 214)
    throw new Error('Expected a valaxy-addon-* npm package name.')
}

function safeUrl(value: unknown) {
  if (typeof value !== 'string')
    return undefined
  try {
    const url = new URL(normalizeRepositoryUrl(value))
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined
  }
  catch {
    return undefined
  }
}

export async function fetchAddonPackage(name: string): Promise<AddonPackageDetails> {
  assertAddonName(name)
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, {
    signal: AbortSignal.timeout(10_000),
    redirect: 'error',
    headers: { accept: 'application/json' },
  })
  if (!response.ok)
    throw new Error(`npm registry request failed (${response.status}).`)
  const raw = await response.text()
  if (raw.length > 1_000_000)
    throw new Error('Package metadata is too large.')
  const data = JSON.parse(raw)
  if (data.name !== name || typeof data.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(data.version))
    throw new Error('The registry returned invalid package metadata.')
  return {
    name,
    version: data.version,
    description: typeof data.description === 'string' ? data.description.slice(0, 2000) : '',
    homepage: safeUrl(data.homepage),
    repository: safeUrl(typeof data.repository === 'string' ? data.repository : data.repository?.url),
    license: typeof data.license === 'string' ? data.license : undefined,
    peerDependencies: Object.fromEntries(Object.entries(data.peerDependencies || {}).filter((entry): entry is [string, string] => typeof entry[1] === 'string')),
  }
}

/** Argument arrays and disabled lifecycle scripts keep package actions bounded. */
export function runAddonPackageManager(root: string, args: string[], onLog: (text: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, { cwd: root, shell: false, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '0' } })
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill()
    }, 300_000)
    const stop = () => child.kill()
    process.once('exit', stop)
    const cleanup = () => {
      clearTimeout(timer)
      process.off('exit', stop)
    }
    child.stdout?.on('data', data => onLog(String(data)))
    child.stderr?.on('data', data => onLog(String(data)))
    child.once('error', (error) => {
      cleanup()
      reject(new Error(`Could not start pnpm: ${error.message}`))
    })
    child.once('close', (code) => {
      cleanup()
      if (timedOut)
        reject(new Error('Package operation timed out. Check the project dependency files before retrying.'))
      else if (code !== 0)
        reject(new Error(`pnpm exited with code ${code}. Check the log and project dependency files before retrying.`))
      else resolve()
    })
  })
}

async function optionalRead(file: string): Promise<string | undefined> {
  try {
    return await fs.readFile(file, 'utf8')
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      return undefined
    throw error
  }
}

async function workspaceRoot(root: string) {
  let current = root
  while (true) {
    if (await fs.pathExists(pathe.join(current, 'pnpm-workspace.yaml')))
      return current
    const parent = pathe.dirname(current)
    if (parent === current)
      return root
    current = parent
  }
}

async function snapshot(root: string) {
  const packageFile = await resolveInsideRoot(root, 'package.json')
  const packageSource = await optionalRead(packageFile)
  const pkg = packageSource ? JSON.parse(packageSource) : {}
  const workspace = await workspaceRoot(root)
  const files = new Map<string, string | undefined>([[packageFile, packageSource]])
  const configs: { path: string, source: string }[] = []
  for (const name of configNames) {
    const file = await resolveInsideRoot(root, name)
    const source = await optionalRead(file)
    files.set(file, source)
    if (source !== undefined)
      configs.push({ path: file, source })
  }
  for (const name of ['pnpm-lock.yaml', 'pnpm-workspace.yaml']) {
    const file = await resolveInsideRoot(workspace, name)
    files.set(file, await optionalRead(file))
  }
  const otherLock = await Promise.all(['package-lock.json', 'yarn.lock', 'bun.lock', 'bun.lockb'].map(name => fs.pathExists(pathe.join(root, name))))
  const declaredManager = typeof pkg.packageManager === 'string' ? pkg.packageManager : ''
  const managementError = !packageSource
    ? 'This project has no package.json.'
    : declaredManager && !declaredManager.startsWith('pnpm@')
      ? 'This project uses another package manager. Manage its addons in your terminal.'
      : !declaredManager && otherLock.some(Boolean)
          ? 'A non-pnpm lockfile was found. Manage this project with its existing package manager.'
          : configs.length > 1 ? 'Multiple Valaxy configuration files were found. Keep a single configuration before managing addons.' : undefined
  const revision = createHash('sha256').update(JSON.stringify([...files])).digest('hex')
  return { pkg, configs, workspace, revision, managementError }
}

async function installedPackage(root: string, name: string) {
  let current = root
  while (true) {
    const source = await optionalRead(pathe.join(current, 'node_modules', name, 'package.json'))
    if (source) {
      const pkg = JSON.parse(source)
      return pkg.name === name ? pkg : undefined
    }
    const parent = pathe.dirname(current)
    if (parent === current)
      return undefined
    current = parent
  }
}

async function assertNoOtherReferences(root: string, name: string, configFile?: string) {
  const files = await fg('**/*.{ts,mts,cts,js,mjs,cjs,jsx,tsx,vue}', { cwd: root, absolute: true, followSymbolicLinks: false, ignore: ['**/node_modules/**', '**/dist/**', '**/.valaxy/**', '**/.output/**', '**/.nuxt/**'] })
  if (files.length > 5000)
    throw new Error('This project is too large to check automatically. Remove the addon using your editor and package manager.')
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const reference = new RegExp(`['"\x60]${escaped}(?:/[^'"\x60\\n]*)?['"\x60]`)
  const remaining: string[] = []
  for (const file of files) {
    if (pathe.normalize(file) !== configFile && reference.test(await fs.readFile(await resolveInsideRoot(root, file), 'utf8')))
      remaining.push(pathe.relative(root, file))
  }
  if (remaining.length)
    throw new Error(`Remove this addon's other source references first: ${remaining.slice(0, 10).join(', ')}`)
}

export function createAddonManager(options: ValaxyDevtoolsOptions, dependencies: ManagerDependencies = {}) {
  const rootPath = pathe.resolve(options.userRoot || process.cwd())
  const fetchPackage = dependencies.fetchPackage || fetchAddonPackage
  const run = dependencies.run || runAddonPackageManager
  async function context() {
    const root = pathe.normalize(await fs.realpath(rootPath))
    let state = states.get(root)
    if (!state) {
      state = { plans: new Map(), jobs: new Map() }
      states.set(root, state)
    }
    return { root, state }
  }

  async function inventory(): Promise<AddonInventory> {
    const { root, state } = await context()
    const current = await snapshot(root)
    const active = options.getAddons?.() || []
    const declared = Object.assign({}, ...dependencyFields.map(field => current.pkg[field] || {})) as Record<string, string>
    const names = new Set([...Object.keys(declared), ...active.map(addon => addon.name)])
    const installed: InstalledAddon[] = []
    for (const name of names) {
      if (!/^valaxy-addon-[a-z0-9][a-z0-9._-]*$/.test(name))
        continue
      const enabled = active.find(addon => addon.name === name)
      const pkg = await installedPackage(root, name)
      if (!declared[name] && !pkg && !enabled)
        continue
      installed.push({ name, version: pkg?.version || enabled?.version, description: pkg?.description, specifier: declared[name], direct: Object.hasOwn(declared, name), enabled: !!enabled })
    }
    return { installed: installed.sort((a, b) => a.name.localeCompare(b.name)), packageManager: current.managementError ? null : 'pnpm', managementError: current.managementError, configFile: current.configs[0]?.path, operation: state.operation ? structuredClone(state.operation) : undefined }
  }

  async function prepare(action: 'install' | 'remove', name: string): Promise<AddonOperationPlan> {
    assertAddonName(name)
    if (action !== 'install' && action !== 'remove')
      throw new Error('Unknown addon operation.')
    const { root, state } = await context()
    const current = await snapshot(root)
    if (current.managementError)
      throw new Error(current.managementError)
    if (busyWorkspaces.has(current.workspace))
      throw new Error('A package operation is already running in this workspace.')
    const direct = dependencyFields.some(field => Object.hasOwn(current.pkg[field] || {}, name))
    if (action === 'install' && direct)
      throw new Error('This addon is already declared in package.json.')
    if (action === 'remove' && !direct)
      throw new Error('Only direct dependencies of this project can be removed.')
    if (action === 'install' && !addons.some(addon => addon.name === name))
      throw new Error('This addon is not in the curated catalog. Install it in your terminal after reviewing it.')
    const plan: AddonOperationPlan = { id: randomUUID(), action, name, command: '' }
    let args: string[]
    if (action === 'install') {
      const details = await fetchPackage(name)
      if (details.name !== name || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(details.version))
        throw new Error('Invalid package version.')
      plan.version = details.version
      args = ['add', '--save-exact', '--ignore-scripts', '--registry=https://registry.npmjs.org', `${name}@${details.version}`]
    }
    else {
      const config = current.configs[0]
      await assertNoOtherReferences(root, name, config?.path)
      if (config) {
        const after = removeAddonFromConfig(config.source, name)
        if (after !== config.source) {
          plan.configFile = config.path
          plan.configBefore = config.source
          plan.configAfter = after
        }
        else if (options.getAddons?.().some(addon => addon.name === name)) {
          throw new Error('This addon is enabled by an inherited or dynamic configuration. Remove that reference first.')
        }
      }
      args = ['remove', '--ignore-scripts', name]
    }
    // pnpm requires an explicit acknowledgement for the workspace root itself.
    if (root === current.workspace && await fs.pathExists(pathe.join(root, 'pnpm-workspace.yaml')))
      args.push('--workspace-root')
    plan.command = `pnpm ${args.join(' ')}`
    for (const [id, entry] of state.plans) {
      if (entry.expires < Date.now() || state.plans.size >= 20)
        state.plans.delete(id)
    }
    state.plans.set(plan.id, { plan, args, revision: current.revision, expires: Date.now() + 300_000 })
    return structuredClone(plan)
  }

  async function apply(id: string): Promise<AddonOperation> {
    const { root, state } = await context()
    if (state.jobs.has(id))
      return structuredClone(state.jobs.get(id)!)
    const stored = state.plans.get(id)
    if (!stored || stored.expires < Date.now())
      throw new Error('The operation preview expired. Review a new preview before continuing.')
    const current = await snapshot(root)
    if (current.revision !== stored.revision)
      throw new Error('Project configuration or dependencies changed. Review a new preview before continuing.')
    if (stored.plan.action === 'remove')
      await assertNoOtherReferences(root, stored.plan.name, current.configs[0]?.path)
    if (state.jobs.has(id))
      return structuredClone(state.jobs.get(id)!)
    if (busyWorkspaces.has(current.workspace))
      throw new Error('A package operation is already running in this workspace.')
    busyWorkspaces.add(current.workspace)
    const operation: AddonOperation = { ...stored.plan, status: 'running', log: '' }
    state.jobs.set(id, operation)
    state.plans.delete(id)
    state.operation = operation
    while (state.jobs.size > 20)
      state.jobs.delete(state.jobs.keys().next().value!)
    const log = (text: string) => {
      operation.log = (operation.log + text).slice(-20_000)
    }
    void (async () => {
      let configChanged = false
      try {
        if (operation.configFile) {
          await resolveInsideRoot(root, operation.configFile)
          await updatePageFile(operation.configFile, (source) => {
            if (source !== operation.configBefore)
              throw new Error('Configuration changed after preview. No package command was run.')
            return { content: operation.configAfter!, result: undefined }
          })
          configChanged = true
        }
        await run(root, stored.args, log)
        const updated = await snapshot(root)
        const declared = dependencyFields.some(field => Object.hasOwn(updated.pkg[field] || {}, operation.name))
        if (declared !== (operation.action === 'install'))
          throw new Error('pnpm finished but package.json did not reflect the requested change.')
        if (operation.action === 'install' && (await installedPackage(root, operation.name))?.version !== operation.version)
          throw new Error('The installed addon version does not match the reviewed version. Check the project dependencies.')
        operation.status = 'succeeded'
      }
      catch (error) {
        operation.status = 'failed'
        operation.error = error instanceof Error ? error.message : String(error)
        if (configChanged && operation.configFile) {
          try {
            const updated = await snapshot(root)
            if (!dependencyFields.some(field => Object.hasOwn(updated.pkg[field] || {}, operation.name)))
              throw new Error('The dependency was already removed. Its configuration references remain removed; inspect the dependency files before retrying.')
            await resolveInsideRoot(root, operation.configFile)
            await updatePageFile(operation.configFile, (source) => {
              if (source !== operation.configAfter)
                throw new Error('Configuration was edited externally; it was preserved instead of restoring the preview.')
              return { content: operation.configBefore!, result: undefined }
            })
          }
          catch (rollbackError) {
            log(`\n${String(rollbackError)}\n`)
          }
        }
      }
      finally {
        busyWorkspaces.delete(current.workspace)
      }
    })()
    return structuredClone(operation)
  }

  return { inventory, prepare, apply, details: fetchPackage }
}
