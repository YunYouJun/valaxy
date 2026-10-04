import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import template from '../packages/create-valaxy/template-blog/package.json'

const entry = pathToFileURL(resolve('packages/create-valaxy/src/index.ts')).href
const prompts = pathToFileURL(resolve('node_modules/prompts/index.js')).href
const tsx = resolve('node_modules/tsx/dist/cli.mjs')
const blog = { name: 'blog', message: 'Project name:', initial: 'valaxy-blog' }
let root: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-create-cli-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

async function scaffold(args: string[], answers: unknown[] = []) {
  // Use the real prompt library; skipped questions must not produce fake answers.
  const runner = join(root, 'runner.mts')
  await writeFile(runner, `import prompts from ${JSON.stringify(prompts)}
prompts.inject(${JSON.stringify(answers)})
process.argv = [process.execPath, 'create-valaxy', ...${JSON.stringify(args)}]
await import(${JSON.stringify(entry)})
`)
  return spawnSync(process.execPath, [tsx, runner], { cwd: root, encoding: 'utf8', timeout: 10000 })
}

async function manifest(directory: string) {
  return JSON.parse(await readFile(join(root, directory, 'package.json'), 'utf8'))
}

describe('create-valaxy CLI', () => {
  it.each(['yun', 'press'])('creates a named project after selecting %s interactively', async (theme) => {
    const result = await scaffold(['my-blog'], [blog, theme, false])
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect(await manifest('my-blog')).toMatchObject({
      name: 'my-blog',
      dependencies: { [`valaxy-theme-${theme}`]: template.dependencies.valaxy },
      devDependencies: { vite: template.devDependencies.vite },
    })
    expect(await readFile(join(root, 'my-blog/valaxy.config.ts'), 'utf8')).toContain(`theme: '${theme}'`)
  })

  it('retains the template flag when its prompt is skipped', async () => {
    const result = await scaffold(['my-blog', '--template', 'blog'], ['press', false])
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect((await manifest('my-blog')).dependencies).toHaveProperty('valaxy-theme-press')
  })

  it('uses a valid package name for a nested positional directory', async () => {
    const result = await scaffold(['sites/my-blog'], [blog, 'yun', 'custom-blog', false])
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect((await manifest('sites/my-blog')).name).toBe('custom-blog')
  })

  it('honors an absolute destination in noninteractive mode', async () => {
    const result = await scaffold([join(root, 'absolute-blog'), '--yes'])
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect((await manifest('absolute-blog')).dependencies).toHaveProperty('valaxy-theme-yun')
  })

  it('honors the addon template flag in noninteractive mode', async () => {
    const result = await scaffold(['my-addon', '--template', 'addon', '--yes'])
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect(await readFile(join(root, 'my-addon/index.ts'), 'utf8')).toContain('export')
    expect((await manifest('my-addon')).name).toBe('my-addon')
  })

  it('exits unsuccessfully for an invalid noninteractive template', async () => {
    const result = await scaffold(['my-blog', '--template', 'unknown', '--yes'])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Unknown template: unknown')
  })

  it('refuses to overwrite existing files in noninteractive mode', async () => {
    await mkdir(join(root, 'existing'))
    await writeFile(join(root, 'existing/package.json'), '{"name":"keep-me"}')
    const result = await scaffold(['existing', '--yes'])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('is not empty')
    expect(await readFile(join(root, 'existing/package.json'), 'utf8')).toBe('{"name":"keep-me"}')
  })
})
