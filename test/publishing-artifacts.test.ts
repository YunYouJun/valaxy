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
  nestedHeading: 'NESTEDHEADINGPRIVATE876',
  nestedChild: 'NESTEDCHILDPRIVATE876',
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
      social: [
        { name: 'Profile', link: 'https://social.example/@author', icon: 'i-ri-user-line', color: 'gray' },
        { name: 'Duplicate', link: ' https://social.example/@author ', icon: 'i-ri-user-line', color: 'gray' },
        { name: 'About', link: '/blog/about', icon: 'i-ri-user-line', color: 'gray' },
        { name: 'RSS', link: '/atom.xml', icon: 'i-ri-rss-line', color: 'gray' },
        { name: 'Mail', link: 'mailto:author@example.com', icon: 'i-ri-mail-line', color: 'gray' },
        { name: 'Subscribe', link: '/subscribe', sameAs: false, icon: 'i-ri-rss-line', color: 'gray' },
      ],
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

function schemaGraph(html: string): Record<string, any>[] {
  const json = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  expect(json).toBeTruthy()
  return JSON.parse(json!)['@graph']
}

function articleImage(html: string) {
  const graph = schemaGraph(html)
  const article = graph.find(node => [node['@type']].flat().includes('BlogPosting'))
  expect(article).toBeDefined()
  const image = article?.image
  return graph.find(node => node['@id'] === image?.['@id'])?.url
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
      await write('pages/posts/cover-image.md', '---\ntitle: Cover image\ndate: 2024-01-01\ncover: ./pic.svg?size=2#cover\n---\nCover image.')
      await write('public/legacy.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>')
      await write('pages/posts/legacy-image.md', '---\ntitle: Legacy image\ndate: 2024-01-01\nimage: /legacy.svg?size=2#legacy\ncover: /ignored.png\n---\nLegacy image.')
      await write('pages/posts/image-priority.md', '---\ntitle: Image priority\ndate: 2024-01-01\nogImage: ./pic.svg#og\nimage: /ignored-legacy.png\ncover: /ignored-cover.png\n---\n![ignored](./my%20pic.svg)')
      await write('pages/posts/invalid-image.md', '---\ntitle: Invalid image\ndate: 2024-01-01\nogImage: "javascript:alert(1)"\ncover: HelloCover\n---\n![public](./pic.svg)')
      await write('pages/posts/no-image.md', '---\ntitle: No image\ndate: 2024-01-01\ncover: HelloCover\n---\nNo image.')
      await write('pages/posts/manual-summary.md', '---\ntitle: Manual summary\ndate: 2024-01-01\ndescription: " "\nexcerpt: "Manual **public** [summary](/about)."\n---\nDifferent body opening.')
      await write('pages/posts/draft.md', `---\ntitle: ${sentinels.draft}\ndraft: true\ndate: 2024-01-01\n---\n${sentinels.draft}`)
      await write('pages/posts/draft-parent.md', `---\ntitle: ${sentinels.parentDraft}\ndraft: true\ndate: 2024-01-01\n---\n${sentinels.parentDraft}`)
      await write('pages/posts/draft-parent/child.md', '---\ntitle: Public child\ndraft: false\ndate: 2024-01-01\n---\nPUBLICCHILDVISIBLE876')
      await write('pages/_drafts/private.md', `---\ntitle: Hidden path\n---\n${sentinels.underscore}`)
      await write('pages/README.md', sentinels.readme)
      await write('pages/posts/password.md', `---\ntitle: Password protected\npassword: fixture-password\ndate: 2024-01-01\n---\n# ${sentinels.password}\n\n${sentinels.password}`)
      await write('pages/posts/encrypted.md', `---\ntitle: Environment protected\nencrypt: true\ndate: 2024-01-01\n---\n# ${sentinels.encrypted}\n\n${sentinels.encrypted}`)
      await write('pages/posts/partial.md', `---\ntitle: Partial public page\ndate: 2024-01-01\n---\n## Public heading\n\nPUBLICPARTIALVISIBLE876\n\n<!-- valaxy-encrypt-start:fixture -->\n## ${sentinels.partial}\n\n${sentinels.partial}\n![private](/${sentinels.partial}.png)\n<!-- more -->\n<!--valaxy-encrypt-end-->\n${sentinels.partialTail}\n<!-- valaxy-encrypt-end -->\n\nPublic ending.\n![public](./pic.svg#partial)`)
      await write('pages/posts/nested-partial.md', `---\ntitle: Nested partial page\ndate: 2024-01-01\n---\n## Public parent\n\n<!-- valaxy-encrypt-start:fixture -->\n### ${sentinels.nestedHeading}\n\n#### ${sentinels.nestedChild}\n\nPrivate nested body.\n<!-- valaxy-encrypt-end -->\n\n##### Public descendant\n\nPublic descendant body.\n\n### Public sibling`)

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
        const nestedPartial = await readFile(join(dist, 'posts/nested-partial.html'), 'utf8')
        expect(nestedPartial).toContain('public-descendant')
        expect(nestedPartial).toContain('public-sibling')
        const regular = await readFile(join(dist, 'posts/public.html'), 'utf8')
        expect(metadata(regular, 'description')).toContain('snake_case_name with 2 * 3 * 4')
        const identity = schemaGraph(regular).find(node => node['@id'].endsWith('#identity'))
        expect(identity?.sameAs).toEqual(['https://social.example/@author', 'https://example.com/blog/about'])
        expect(regular).toContain('href="/blog/about"')
        expect(regular).toContain('href="/atom.xml"')
        expect(regular).toContain('href="mailto:author@example.com"')
        expect(regular).toContain('href="/subscribe"')
        const feed = JSON.parse(await readFile(join(dist, 'feed.json'), 'utf8'))
        expect(feed.items.find((item: any) => item.title === 'Manual summary').summary).toBe('Manual public summary.')
        for (const file of ['atom.xml', 'feed.xml']) {
          expect(await readFile(join(dist, file), 'utf8')).toContain('Manual public summary.')
        }
        const legacy = await readFile(join(dist, 'posts/legacy-image.html'), 'utf8')
        expect(metadata(legacy, 'og:image')).toBe('https://example.com/blog/legacy.svg?size=2#legacy')
        expect(articleImage(legacy)).toBe(metadata(legacy, 'og:image'))
        for (const page of ['posts/no-image.html', 'posts/password.html', 'posts/encrypted.html']) {
          const html = await readFile(join(dist, page), 'utf8')
          expect(metadata(html, 'og:image'), page).toBeUndefined()
          expect(articleImage(html), page).toBeUndefined()
        }
        for (const [page, suffix] of [['posts/public.html', '?size=2&height=3#view'], ['posts/imgdir.html', ''], ['posts/spaced-image.html', ''], ['posts/explicit-image.html', '?width=80&height=40#view'], ['posts/cover-image.html', '?size=2#cover'], ['posts/image-priority.html', '#og'], ['posts/invalid-image.html', ''], ['posts/partial.html', '#partial']]) {
          const html = await readFile(join(dist, page), 'utf8')
          const image = metadata(html, 'og:image')
          expect(image, page).toMatch(/^https:\/\/example\.com\/blog\/assets\/[^?#]+\.svg/)
          expect(image!.endsWith(suffix)).toBe(true)
          const url = new URL(image!)
          expect(await fs.pathExists(join(dist, decodeURIComponent(url.pathname).replace('/blog/', ''))), image).toBe(true)
          expect(metadata(html, 'twitter:image')).toBe(image)
          expect(articleImage(html), page).toBe(image)
        }
      }
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  }, 240_000)
})
