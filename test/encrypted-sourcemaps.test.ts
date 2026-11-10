import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import { Buffer } from 'node:buffer'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'
import { expect, it } from 'vitest'
import { StateManager } from '../packages/valaxy/node/app/state'
import { createMarkdownPlugin } from '../packages/valaxy/node/plugins/markdown/transform'
import { createValaxyPlugin } from '../packages/valaxy/node/plugins/valaxy'

it.each([true, 'hidden', 'inline'].flatMap(sourcemap => [false, true].map(transformPaths => ({ sourcemap: sourcemap as true | 'hidden' | 'inline', transformPaths }))))('redacts encrypted Markdown from $sourcemap maps (transformPaths=$transformPaths) and preserves public sources', async ({ sourcemap, transformPaths }) => {
  const root = await mkdtemp(resolve('test/fixtures/.encrypted-maps-'))
  const state = new StateManager()
  const privateBody = 'SOURCEMAP_PRIVATE_BODY_872'
  const password = 'SOURCEMAP_PASSWORD_872'
  const partialPassword = 'PARTIAL_PASSWORD_872'
  const includedSecret = 'INCLUDED_PRIVATE_BODY_872'
  const publicSource = '# SOURCEMAP_PUBLIC_BODY_872'
  const galleryPassword = 'GALLERY_PASSWORD_872'
  const galleryPhoto = 'GALLERY_PRIVATE_PHOTO_872'
  const secrets = [privateBody, password, partialPassword, includedSecret, galleryPassword, galleryPhoto]
  try {
    const files: Record<string, string> = {
      'public.md': publicSource,
      'gallery.md': `---\ngallery_password: ${galleryPassword}\nphotos:\n  - https://example.com/${galleryPhoto}.jpg\n---\nGALLERY_PUBLIC_BODY_872`,
      'whole.md': `---\npassword: ${password}\n---\n${privateBody}`,
      'partial.md': `# Public\n\n<!-- valaxy-encrypt-start:${partialPassword} -->\n${privateBody}\n<!-- valaxy-encrypt-end -->`,
      'included.md': '# Public include\n\n<!-- @include: ./fragment.md -->',
      'fragment.md': `<!-- valaxy-encrypt-start:${partialPassword} -->\n${includedSecret}\n<!-- valaxy-encrypt-end -->`,
      'entry.js': 'import a from "./public.md"; import b from "./whole.md"; import c from "./partial.md"; import d from "./included.md"; import e from "./gallery.md"; console.log(a,b,c,d,e)',
    }
    await Promise.all(Object.entries(files).map(([file, text]) => writeFile(join(root, file), text)))
    const options = {
      userRoot: root,
      pages: [],
      mode: 'build',
      config: {
        build: { ignoreDeadLinks: false },
        features: {},
        markdown: { highlight: (code: string) => code },
        siteConfig: { encrypt: { enable: true, iv: Array.from({ length: 16 }).fill(1), salt: Array.from({ length: 16 }).fill(2) }, lastUpdated: false },
      },
    } as unknown as ResolvedValaxyOptions
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [await createMarkdownPlugin(options, undefined, state), await createValaxyPlugin(options, {}, state), vue({ include: [/\.vue$/, /\.md$/] })],
      build: {
        write: false,
        minify: false,
        sourcemap,
        rollupOptions: {
          input: join(root, 'entry.js'),
          external: ['vue', 'valaxy'],
          output: transformPaths ? { sourcemapPathTransform: source => `app:///${source}` } : {},
        },
      },
    })
    if (!('output' in result))
      throw new Error('Expected a single Vite build output')
    const maps: any[] = []
    for (const output of result.output) {
      const content = output.type === 'chunk' ? output.code : String(output.source)
      if (output.fileName.endsWith('.map'))
        maps.push(JSON.parse(content))
      for (const match of content.matchAll(/sourceMappingURL=data:application\/json[^,]*;base64,(\S+)/g))
        maps.push(JSON.parse(Buffer.from(match[1], 'base64').toString()))
      for (const sentinel of secrets)
        expect(content).not.toContain(sentinel)
    }
    expect(result.output.some(output => output.type === 'chunk' && output.code.includes('GALLERY_PUBLIC_BODY_872'))).toBe(true)
    expect(maps.length).toBeGreaterThan(0)
    expect(maps.some(map => map.sourcesContent?.includes(publicSource))).toBe(true)
    for (const map of maps) {
      expect(map.mappings.length).toBeGreaterThan(0)
      for (const sentinel of secrets)
        expect(JSON.stringify(map)).not.toContain(sentinel)
    }
  }
  finally {
    state.dispose()
    await rm(root, { recursive: true, force: true })
  }
}, 30_000)
