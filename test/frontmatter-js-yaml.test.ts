import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import matter from '@11ty/gray-matter'
import { build } from 'unbuild'
import { describe, expect, it } from 'vitest'
import buildConfig from '../packages/valaxy/build.config'
import { matterOptions } from '../packages/valaxy/node/plugins/markdown/transform/matter'
import valaxyPkg from '../packages/valaxy/package.json'

const runNode = promisify(execFile)

describe('frontmatter under js-yaml 5', () => {
  it('keeps CORE_SCHEMA parsing and serialization', () => {
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

  it('builds a Markdown adapter without gray-matter or Node loader hooks', async () => {
    const root = await mkdtemp(join(tmpdir(), 'valaxy-gray-matter-'))
    const modules = join(root, 'node_modules')
    try {
      await writeFile(join(root, 'package.json'), JSON.stringify({
        name: 'valaxy-frontmatter-fixture',
        type: 'module',
        dependencies: valaxyPkg.dependencies,
        devDependencies: valaxyPkg.devDependencies,
      }))
      await writeFile(join(root, 'index.ts'), 'export { default } from \'unplugin-vue-markdown/vite\'')
      await symlink(join(import.meta.dirname, '../node_modules'), modules, 'dir')
      await build(root, false, { ...buildConfig[0], entries: ['index'], declaration: 'node16' })
      const types = await readFile(join(root, 'dist/index.d.mts'), 'utf8')
      expect(types).not.toMatch(/from ["'](?:gray-matter|unplugin-vue-markdown|@mdit-vue\/)/)

      // Load the actual bundle outside the workspace, with a broken old parser
      // and only its declared runtime dependencies available.
      await rm(modules)
      for (const name of ['@11ty/gray-matter', 'markdown-exit', 'unplugin', 'unplugin-utils']) {
        const destination = join(modules, name)
        await mkdir(dirname(destination), { recursive: true })
        await symlink(join(import.meta.dirname, '../node_modules', name), destination, 'dir')
      }
      const crashing = join(modules, 'gray-matter')
      await mkdir(crashing)
      await writeFile(join(crashing, 'index.js'), 'throw new Error("old gray-matter was imported")')
      const script = join(root, 'run.mjs')
      await writeFile(script, [
        'import Markdown from \'./dist/index.mjs\'',
        'const plugin = Markdown({ frontmatterOptions: { renderExcerpt: false } })',
        'const transform = typeof plugin.transform === "function" ? plugin.transform : plugin.transform.handler',
        'const result = await transform.call({ error(e) { throw e } }, \'---\\ntitle: no\\ndate: 2020-01-02\\n---\\n# Body\', \'/post.md\')',
        'if (!result.code.includes(\'"title":"no"\') || !result.code.includes(\'"date":"2020-01-02"\'))',
        '  throw new Error(result.code)',
        'console.log("ok")',
      ].join('\n'))
      const result = await runNode(process.execPath, [script], { env: { ...process.env, NODE_OPTIONS: '' } })
      expect(result.stderr).toBe('')
      expect(result.stdout.trim()).toBe('ok')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
