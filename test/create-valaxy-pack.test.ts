import { spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { expect, it } from 'vitest'
import manifest from '../packages/create-valaxy/package.json'

it('packs starter sources without local builds, caches, feeds or environment files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-pack-'))
  const generated = [
    'dist/index.html',
    'dist-ssr/index.js',
    '.valaxy/components.d.ts',
    '.vite-ssg-temp/main.js',
    '.vite-ssg-dist/main.js',
    '.env',
    '.env.local',
    'debug.log',
    'public/atom.xml',
    'public/feed.xml',
    'public/feed.json',
    'public/valaxy-fuse-list.json',
  ]
  try {
    // Exercise the package manager's real file selection in an isolated package.
    // No registry access or dependency installation is needed to pack it.
    await writeFile(join(root, 'package.json'), JSON.stringify({
      name: manifest.name,
      version: manifest.version,
      files: manifest.files,
    }))
    for (const template of ['template-blog', 'template-blog-press']) {
      await cp(resolve('packages/create-valaxy', template), join(root, template), { recursive: true })
      for (const file of generated) {
        const target = join(root, template, file)
        await mkdir(dirname(target), { recursive: true })
        await writeFile(target, 'local artifact: must not be distributed')
      }
    }
    await mkdir(join(root, 'dist'))
    await writeFile(join(root, 'dist/index.mjs'), '// built CLI')
    const result = spawnSync('pnpm', ['pack', '--json'], { cwd: root, encoding: 'utf8', timeout: 30_000 })
    expect(result.status, result.stdout + result.stderr).toBe(0)
    const packed = JSON.parse(result.stdout)
    const files: string[] = (Array.isArray(packed) ? packed[0] : packed).files.map((file: { path: string }) => file.path)
    for (const template of ['template-blog', 'template-blog-press']) {
      for (const file of generated)
        expect(files).not.toContain(`${template}/${file}`)
    }
    for (const file of [
      'dist/index.mjs',
      'template-blog/package.json',
      'template-blog/pnpm-workspace.yaml',
      'template-blog/_gitignore',
      'template-blog/.github/workflows/gh-pages.yml',
      'template-blog/.vscode/settings.json',
      'template-blog/pages/posts/hello-valaxy.md',
      'template-blog/components/covers/HelloValaxyCover.vue',
      'template-blog/public/favicon.svg',
      'template-blog-press/pages/index.md',
    ])
      expect(files).toContain(file)
    expect(await readFile(join(root, 'template-blog/dist/index.html'), 'utf8')).toContain('local artifact')
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
}, 40_000)
