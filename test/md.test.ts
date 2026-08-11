// import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from '../packages/valaxy/node/plugins/markdown'
import { createMarkdownBaseContext } from '../packages/valaxy/node/plugins/markdown/base'
import { fixtureFolder } from './shared'

// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('md parse', async () => {
  const md = await createMarkdownRenderer()

  it('i18n:header', () => {
    const content = md.render('## Header {lang="en"}')
    const result = '<h2 lang="en" id="header" tabindex="-1">Header <a class="header-anchor" href="#header" aria-label="Permalink to &quot;Header {lang=&quot;en&quot;}&quot;">&ZeroWidthSpace;</a></h2>'
    expect(content.trim()).toEqual(result)
  })

  it('i18n:content', () => {
    const content = md.render('::: en\nContent\n:::')
    const result = '<div lang="en">\n<p>Content</p>\n</div>'
    expect(content.trim()).toEqual(result)
  })
})

describe('markdown base paths', async () => {
  const base = createMarkdownBaseContext('/repo/')
  const md = await createMarkdownRenderer(undefined, base)

  it('prepends base to root-absolute page and public file links', () => {
    const content = md.render(`
[Guide](/guide/)

[PDF](/manual.pdf?download=1)

[PDF section](/manual.pdf#section)
    `)

    expect(content).toContain('href="/repo/guide/"')
    expect(content).toContain('href="/repo/manual.pdf?download=1"')
    expect(content).toContain('href="/repo/manual.pdf#section"')
  })

  it('uses the latest resolved base for every render', () => {
    base.value = '/version/latest/'
    expect(md.render('[Guide](/guide/)')).toContain('href="/version/latest/guide/"')
    base.value = '/repo/'
  })

  it('leaves external, relative, anchor, and raw HTML links unchanged', () => {
    const content = md.render(`
[External](https://example.com/guide/)

[Relative](./guide/)

[Anchor](#section)

<a href="/raw/">Raw HTML</a>
    `)

    expect(content).toContain('href="https://example.com/guide/"')
    expect(content).toContain('href="./guide/"')
    expect(content).toContain('href="#section"')
    expect(content).toContain('<a href="/raw/">Raw HTML</a>')
  })

  it('normalizes Markdown image paths for the Vue asset pipeline', () => {
    const content = md.render(`
![Root absolute](/image.png)

![Relative](image.png)

![External](https://example.com/image.png)
    `)

    expect(content).toContain('src="/image.png"')
    expect(content).toContain('src="./image.png"')
    expect(content).toContain('src="https://example.com/image.png"')
  })

  it('emits base-adjusted public image URLs through the Vite asset pipeline', async () => {
    const template = md.render('![Public image](/base-image.svg)')
    const virtualId = '/valaxy-base-test.vue'
    const result = await build({
      root: fixtureFolder.userRoot,
      base: '/repo/',
      logLevel: 'silent',
      plugins: [
        {
          name: 'valaxy:test-base-asset',
          resolveId(id) {
            if (id === 'virtual:valaxy-base-test')
              return virtualId
          },
          load(id) {
            if (id === virtualId)
              return `<template><main>${template}</main></template>`
          },
        },
        vue(),
      ],
      build: {
        write: false,
        minify: false,
        rollupOptions: {
          input: 'virtual:valaxy-base-test',
          external: ['vue'],
          preserveEntrySignatures: 'strict',
        },
      },
    })
    const buildResults = (Array.isArray(result) ? result : [result]) as Array<{
      output: Array<{ type: string, code?: string }>
    }>
    const code = buildResults
      .flatMap(item => item.output)
      .filter(output => output.type === 'chunk')
      .map(output => output.code || '')
      .join('\n')

    expect(code).toContain('"/repo/base-image.svg"')
  })
})
