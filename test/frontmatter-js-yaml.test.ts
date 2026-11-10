import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import matter from '@11ty/gray-matter'
import { describe, expect, it } from 'vitest'
import devtoolsPkg from '../packages/devtools/package.json'
import { matterOptions } from '../packages/valaxy/node/plugins/markdown/transform/matter'
import valaxyPkg from '../packages/valaxy/package.json'

const require = createRequire(import.meta.url)
const ensureRedirect = new URL('../packages/valaxy/vendor/ensure-gray-matter.mjs', import.meta.url)

describe('frontmatter under js-yaml 5', () => {
  it('uses @11ty/gray-matter and keeps CORE_SCHEMA parsing', () => {
    expect(valaxyPkg.dependencies).not.toHaveProperty('gray-matter')
    expect(devtoolsPkg.dependencies).not.toHaveProperty('gray-matter')
    expect(valaxyPkg.dependencies?.['@11ty/gray-matter']).toBeTruthy()
    expect(devtoolsPkg.dependencies?.['@11ty/gray-matter']).toBeTruthy()

    const yaml = require('js-yaml') as { load?: unknown, safeLoad?: unknown }
    const version = (require('js-yaml/package.json') as { version: string }).version
    expect(version.startsWith('5.')).toBe(true)
    // gray-matter@4/lib/engines.js does `yaml.safeLoad.bind(yaml)` at import time.
    expect(yaml.safeLoad).toBeUndefined()
    expect(typeof yaml.load).toBe('function')

    const aliased = require('gray-matter/package.json') as { name: string }
    expect(aliased.name).toBe('@11ty/gray-matter')
    expect(() => require('gray-matter')).not.toThrow()
    expect(() => require('@mdit-vue/plugin-frontmatter')).not.toThrow()

    const source = [
      '---',
      'title: Hello',
      'date: 2020-01-02',
      'draft: yes',
      'published: true',
      'count: 2',
      'merged:',
      '  <<: { a: 1 }',
      '  b: 2',
      '---',
      'Intro',
      '',
      '<!-- more -->',
      '',
      'Rest',
      '',
    ].join('\n')

    const parsed = matter(source, matterOptions)
    expect(parsed.data).toMatchObject({
      title: 'Hello',
      date: '2020-01-02',
      draft: 'yes',
      published: true,
      count: 2,
    })
    expect(parsed.data.date).not.toBeInstanceOf(Date)
    expect(parsed.data.merged).toEqual({ '<<': { a: 1 }, 'b': 2 })
    expect(parsed.excerpt).toContain('Intro')
    expect(parsed.excerpt).not.toContain('Rest')
    expect(parsed.content).toContain('Rest')

    const again = matter(matter.stringify(parsed.content, parsed.data, matterOptions), matterOptions)
    expect(again.data.date).toBe('2020-01-02')
    expect(again.data.draft).toBe('yes')
    expect(again.data.published).toBe(true)
    expect(again.data.merged).toEqual({ '<<': { a: 1 }, 'b': 2 })
  })

  it('redirects the frontmatter plugin away from a crashing gray-matter', async () => {
    const without = await runPluginImport(false)
    expect(without.code).not.toBe(0)
    expect(`${without.stderr}\n${without.stdout}`).toMatch(/bind/)

    const withRedirect = await runPluginImport(true)
    expect(withRedirect.stderr).toBe('')
    expect(withRedirect.code).toBe(0)
    expect(withRedirect.stdout).toContain('ok')
  })
})

async function runPluginImport(redirect: boolean) {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-gray-matter-'))
  const plugin = join(root, 'node_modules', '@mdit-vue', 'plugin-frontmatter')
  const crashing = join(root, 'node_modules', 'gray-matter')
  await mkdir(plugin, { recursive: true })
  await mkdir(crashing, { recursive: true })
  await writeFile(join(plugin, 'package.json'), JSON.stringify({ name: '@mdit-vue/plugin-frontmatter', type: 'module' }))
  await writeFile(join(plugin, 'index.js'), [
    'import matter from \'gray-matter\'',
    'const parsed = matter(\'---\\ntitle: Hi\\ndate: 2020-01-02\\n---\\nBody\\n\')',
    'if (parsed.data.title !== \'Hi\' || parsed.data.date instanceof Date)',
    '  throw new Error("unexpected frontmatter " + JSON.stringify(parsed.data))',
    'console.log(\'ok\')',
  ].join('\n'))
  await writeFile(join(crashing, 'package.json'), JSON.stringify({ name: 'gray-matter' }))
  await writeFile(join(crashing, 'index.js'), 'const yaml = {}\nmodule.exports = yaml.safeLoad.bind(yaml)\n')

  const script = join(root, 'run.mjs')
  await writeFile(script, [
    redirect ? `import { ensureGrayMatterRedirect } from ${JSON.stringify(ensureRedirect.href)}` : '',
    redirect ? 'await ensureGrayMatterRedirect()' : '',
    `await import(${JSON.stringify(pathToFileURL(join(plugin, 'index.js')).href)})`,
  ].filter(Boolean).join('\n'))

  return await runNode(script)
}

function runNode(script: string) {
  return new Promise<{ code: number | null, stdout: string, stderr: string }>((resolve, reject) => {
    const child: ChildProcess = spawn(process.execPath, [script], {
      env: { ...process.env, NODE_OPTIONS: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.once('error', reject)
    child.once('exit', code => resolve({ code, stdout, stderr }))
  })
}
