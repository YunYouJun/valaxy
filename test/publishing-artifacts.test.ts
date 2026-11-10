import { execFile } from 'node:child_process'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const repository = resolve(import.meta.dirname, '..')
const sentinels = {
  draft: 'DRAFTARTIFACTPRIVATE876',
  generatedDraft: 'GENERATEDDRAFTPRIVATE876',
  parentDraft: 'PARENTDRAFTPRIVATE876',
  password: 'PASSWORDARTIFACTPRIVATE876',
  encrypted: 'ENCRYPTARTIFACTPRIVATE876',
  partial: 'PARTIALARTIFACTPRIVATE876',
  partialTail: 'PARTIALTAILPRIVATE876',
  underscore: 'UNDERSCOREARTIFACTPRIVATE876',
  readme: 'READMEARTIFACTPRIVATE876',
}

async function outputFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true })
  const files = await Promise.all(entries.map(entry => entry.isDirectory()
    ? outputFiles(join(root, entry.name))
    : [join(root, entry.name)]))
  return files.flat()
}

async function buildFixture(root: string, publishDrafts: boolean, provider: 'fuse' | 'local') {
  const generatedDraft = `---\ntitle: ${sentinels.generatedDraft}\ndraft: true\ndate: 2024-01-01\n---\n${sentinels.generatedDraft}`
  await fs.outputFile(join(root, 'valaxy.config.ts'), `export default {
    theme: 'yun',
    features: { katex: false },
    vite: { base: '/blog/', build: { sourcemap: true } },
    modules: { rss: { enable: true, fullText: true, extractImagePathsFromHTML: false } },
    loaders: [{ name: 'privacy', load: () => [{ path: 'posts/generated-draft.md', content: ${JSON.stringify(generatedDraft)} }] }],
    siteConfig: {
      title: 'Publishing fixture', url: 'https://example.com/blog/', lang: 'en',
      description: 'Public site description',
      author: { name: 'Author' },
      encrypt: { enable: true },
      publishing: { drafts: ${publishDrafts} },
      search: { provider: '${provider}' },
      fuse: { options: { keys: ['title', 'excerpt', 'content'] } },
      llms: { enable: true, fullText: true, files: true },
    },
  }`)
  const source = `import { execBuild } from './packages/valaxy/node/cli/build.ts'; await execBuild({ root: process.argv[1], ssg: true, output: 'dist', log: 'error' })`
  try {
    await exec(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', source, root], {
      cwd: repository,
      env: { ...process.env, CI: 'true', VALAXY_ENCRYPT_PASSWORD: 'fixture-password' },
      maxBuffer: 8 * 1024 * 1024,
      timeout: 120_000,
    })
  }
  catch (error: any) {
    throw new Error(`Publishing fixture build failed:\n${error.stdout || ''}\n${error.stderr || error.message}`)
  }
}

function metadata(html: string, property: string) {
  return html.match(new RegExp(`<meta (?:property|name)="${property}" content="([^"]*)"`))?.[1].replace(/&amp;/g, '&')
}

describe('production publishing artifacts', () => {
  it('keeps private text out of every output and publishes draft lists only when opted in', async () => {
    const root = await mkdtemp(join(repository, 'test/fixtures/.publishing-build-'))
    const write = (file: string, text: string) => fs.outputFile(join(root, file), text)
    try {
      await write('package.json', '{"type":"module","private":true}')
      await write('pages/index.vue', `<script setup>
import { usePageList, usePostList } from 'valaxy'
const pages = usePageList()
const posts = usePostList()
</script>
<template><div><p id="pages">{{ pages.map(page => page.title).join('|') }}</p><p id="posts">{{ posts.map(post => post.title).join('|') }}</p></div></template>`)
      await write('pages/posts/public.md', '---\ntitle: Public article\ndate: 2024-01-01\n---\nPUBLICARTIFACTVISIBLE876 and snake_case_name with 2 * 3 * 4.\n\n![first](./pic.svg?size=2&height=3#view)')
      await write('pages/posts/pic.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path fill="red" d="M0 0h20v20H0z"/></svg>')
      await write('pages/posts/my pic.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle fill="green" cx="10" cy="10" r="10"/></svg>')
      await write('pages/posts/spaced-image.md', '---\ntitle: Spaced image\ndate: 2024-01-01\n---\nPublic spaced image.\n\n![first](./my%20pic.svg)')
      await write('pages/posts/imgdir/index.md', '---\ntitle: Nested image\ndate: 2024-01-01\n---\nNested public image.\n\n![first](./a.svg)')
      await write('pages/posts/imgdir/a.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle fill="blue" cx="10" cy="10" r="10"/></svg>')
      await write('pages/posts/explicit-image.md', '---\ntitle: Explicit image\ndate: 2024-01-01\nogImage: ./my%20pic.svg?width=80&height=40#view\n---\nExplicit public image.')
      await write('pages/posts/draft.md', `---\ntitle: ${sentinels.draft}\ndraft: true\ndate: 2024-01-01\n---\n${sentinels.draft}`)
      await write('pages/posts/draft-parent.md', `---\ntitle: ${sentinels.parentDraft}\ndraft: true\ndate: 2024-01-01\n---\n${sentinels.parentDraft}`)
      await write('pages/posts/draft-parent/child.md', '---\ntitle: Public child\ndraft: false\ndate: 2024-01-01\n---\nPUBLICCHILDVISIBLE876')
      await write('pages/_drafts/private.md', `---\ntitle: Hidden path\n---\n${sentinels.underscore}`)
      await write('pages/README.md', sentinels.readme)
      await write('pages/posts/password.md', `---\ntitle: Password protected\npassword: fixture-password\ndate: 2024-01-01\n---\n# ${sentinels.password}\n\n${sentinels.password}`)
      await write('pages/posts/encrypted.md', `---\ntitle: Environment protected\nencrypt: true\ndate: 2024-01-01\n---\n# ${sentinels.encrypted}\n\n${sentinels.encrypted}`)
      await write('pages/posts/partial.md', `---\ntitle: Partial public page\ndate: 2024-01-01\n---\n## Public heading\n\nPUBLICPARTIALVISIBLE876\n\n<!-- valaxy-encrypt-start:fixture -->\n## ${sentinels.partial}\n\n${sentinels.partial}\n<!-- more -->\n<!--valaxy-encrypt-end-->\n${sentinels.partialTail}\n<!-- valaxy-encrypt-end -->\n\nPublic ending.`)

      for (const publishDrafts of [false, true]) {
        await buildFixture(root, publishDrafts, publishDrafts ? 'local' : 'fuse')
        const dist = join(root, 'dist')
        const files = await outputFiles(dist)
        const artifacts = await Promise.all(files
          .filter(file => /\.(?:html|js|mjs|json|txt|md|xml|map)$/.test(file))
          .map(async file => ({ file, content: await readFile(file, 'utf8') })))
        const output = artifacts.map(item => item.content).join('\n')
        for (const [kind, sentinel] of Object.entries(sentinels)) {
          if (publishDrafts && ['draft', 'generatedDraft', 'parentDraft'].includes(kind))
            expect(output, kind).toContain(sentinel)
          else
            expect.soft(artifacts.filter(item => item.content.toLowerCase().includes(sentinel.toLowerCase())).map(item => item.file), `Leaked ${kind}`).toEqual([])
        }
        expect.soft(artifacts.filter(item => item.content.includes('fixture-password')).map(item => item.file), 'Password in published output').toEqual([])
        expect(output).toContain('PUBLICARTIFACTVISIBLE876')
        expect(await fs.pathExists(join(dist, 'posts/draft-parent/child.html'))).toBe(true)
        expect(await fs.pathExists(join(dist, 'posts/draft.html'))).toBe(publishDrafts)
        expect(await fs.pathExists(join(dist, 'posts/generated-draft.html'))).toBe(publishDrafts)
        const index = await readFile(join(dist, 'index.html'), 'utf8')
        for (const id of ['pages', 'posts']) {
          const list = index.match(new RegExp(`<p id="${id}">([^<]*)</p>`))?.[1]
          expect(list).toContain('Public article')
          expect(list?.includes(sentinels.draft)).toBe(publishDrafts)
          expect(list?.includes(sentinels.generatedDraft)).toBe(publishDrafts)
        }
        const partial = await readFile(join(dist, 'posts/partial.html'), 'utf8')
        expect(partial).toContain('public-heading')
        const regular = await readFile(join(dist, 'posts/public.html'), 'utf8')
        expect(metadata(regular, 'description')).toContain('snake_case_name with 2 * 3 * 4')
        for (const [page, suffix] of [['posts/public.html', '?size=2&height=3#view'], ['posts/imgdir.html', ''], ['posts/spaced-image.html', ''], ['posts/explicit-image.html', '?width=80&height=40#view']]) {
          const html = await readFile(join(dist, page), 'utf8')
          const image = metadata(html, 'og:image')
          expect(image, page).toMatch(/^https:\/\/example\.com\/blog\/assets\/[^?#]+\.svg/)
          expect(image!.endsWith(suffix)).toBe(true)
          const url = new URL(image!)
          expect(await fs.pathExists(join(dist, decodeURIComponent(url.pathname).replace('/blog/', ''))), image).toBe(true)
          expect(metadata(html, 'twitter:image')).toBe(image)
        }
      }
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  }, 240_000)
})
