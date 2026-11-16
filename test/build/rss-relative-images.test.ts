import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { expect, it } from 'vitest'

const exec = promisify(execFile)
const repository = resolve(import.meta.dirname, '../..')

it('points feeds at distinct same-named assets in the configured Vite output directory', async () => {
  const root = await mkdtemp(join(repository, 'test/fixtures/valaxy-rss-relative-'))
  const outDir = join(root, 'site-output')
  const publicDir = join(root, 'static-assets')
  const write = async (file: string, content: string) => {
    const path = join(root, file)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, content)
  }
  const node = async (source: string) => {
    try {
      await exec(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', source, root], {
        cwd: repository,
        env: { ...process.env, CI: 'true' },
        timeout: 60_000,
      })
    }
    catch (error) {
      const failure = error as Error & { stdout?: string, stderr?: string }
      throw new Error(`${failure.stdout || ''}\n${failure.stderr || failure.message}`, { cause: error })
    }
  }
  try {
    await write('package.json', '{"type":"module","private":true}')
    await write('vite.config.mjs', `export default ({ isSsrBuild }) => ({
      base: '/blog/',
      publicDir: 'static-assets',
      build: { outDir: isSsrBuild ? 'server-output' : 'site-output' },
    })`)
    await write('valaxy.config.ts', `export default {
      theme: 'yun',
      features: { katex: false },
      modules: { rss: { enable: true, fullText: true, extractImagePathsFromHTML: true } },
      siteConfig: {
        title: 'RSS fixture', url: 'https://example.com/blog/', lastUpdated: false, llms: { enable: false },
      },
    }`)
    await write('pages/posts/pair/index.md', [
      '---',
      'title: Paired images',
      'date: 2024-01-01',
      '---',
      '![photo](./left%20side/photo.svg?size=2&v=3#preview)',
      '',
      '![photo](./right/photo.svg)',
    ].join('\n'))
    // Exercise emitted assets with the default inline limit.
    for (const [directory, marker] of [['left side', 'left image'], ['right', 'right image']]) {
      await write(`pages/posts/pair/${directory}/photo.svg`, `<svg xmlns="http://www.w3.org/2000/svg"><text>${marker}</text><!--${' '.repeat(5000)}--></svg>`)
    }

    await node('import { execBuild } from "./packages/valaxy/node/cli/build.ts"; await execBuild({ root: process.argv[1], ssg: true, log: "error" })')

    async function checkFeed() {
      const feed = JSON.parse(await readFile(join(outDir, 'feed.json'), 'utf8'))
      const urls = Array.from((feed.items[0].content_html as string).matchAll(/<img\s+src="([^"]+)"/g), match => match[1])
      expect(urls).toHaveLength(2)
      expect(urls[0]).toMatch(/^https:\/\/example\.com\/blog\/assets\/photo\.[^/]+\.svg\?size=2&amp;v=3#preview$/)
      expect(urls[1]).toMatch(/^https:\/\/example\.com\/blog\/assets\/photo\.[^/]+\.svg$/)
      const [left, right] = urls.map(src => new URL(src).pathname)
      expect(left).not.toBe(right)
      expect(await readFile(join(outDir, left.slice('/blog/'.length)), 'utf8')).toContain('left image')
      expect(await readFile(join(outDir, right.slice('/blog/'.length)), 'utf8')).toContain('right image')
      expect(await readFile(join(publicDir, 'feed.json'), 'utf8')).toBe(await readFile(join(outDir, 'feed.json'), 'utf8'))
      await expect(readFile(join(root, 'dist/feed.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
      await expect(readFile(join(root, 'public/feed.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
      await expect(readFile(join(root, 'server-output/feed.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
      for (const filename of ['feed.xml', 'atom.xml']) {
        const xml = await readFile(join(outDir, filename), 'utf8')
        expect(xml).toContain(`https://example.com${left}`)
        expect(xml).toContain(`https://example.com${right}`)
      }
    }
    await checkFeed()
    await rm(join(outDir, 'feed.json'))
    await node('import { run } from "./packages/valaxy/node/cli/index.ts"; await run(["rss", process.argv[1]])')
    await checkFeed()
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
}, 130_000)
