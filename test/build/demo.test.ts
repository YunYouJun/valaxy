import { resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'
import { demoYunDistFolder } from '../config'

// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('check dist', async () => {
  // hello-valaxy.md generate hello-valaxy.html
  it('post should be generated', async () => {
    const helloValaxyHtml = resolve(demoYunDistFolder, 'posts/hello-valaxy.html')
    expect(await fs.exists(helloValaxyHtml)).toBe(true)
  })

  // draft.md not generate draft.html
  it('draft should not be generated', async () => {
    const draftHtml = resolve(demoYunDistFolder, 'posts/draft.html')
    expect(await fs.exists(draftHtml)).toBe(false)
  })
})

describe('built asset loading', () => {
  it.each(['index.html', 'posts/katex.html'])('does not preload the shared KaTeX font catalog in %s', async (file) => {
    const html = await fs.readFile(resolve(demoYunDistFolder, file), 'utf8')
    const preloads = html.match(/<link\s[^>]*rel="preload"[^>]*>/g) || []
    expect(preloads.filter(link => link.includes('KaTeX_'))).toEqual([])
    if (file === 'posts/katex.html')
      expect(html).toContain('class="katex"')
  })

  it('emits optional theme features as separate chunks without preloading them on home', async () => {
    const html = await fs.readFile(resolve(demoYunDistFolder, 'index.html'), 'utf8')
    const assets = await fs.readdir(resolve(demoYunDistFolder, 'assets'))
    for (const feature of ['YunAlgoliaSearch', 'YunFireworks', 'YunFuseSearch', 'scroll']) {
      const chunk = assets.find(file => file.startsWith(`${feature}.`) && file.endsWith('.js'))
      expect(chunk, `${feature} should retain its dynamic import boundary`).toBeDefined()
      expect(html).not.toContain(chunk!)
    }
  })
})

describe('built public SEO', () => {
  it('does not expose whole-page encrypted content in HTML metadata', async () => {
    const html = await fs.readFile(resolve(demoYunDistFolder, 'posts/encrypted-post.html'), 'utf8')
    expect(html).not.toContain('这里是被加密的复杂文章内容')
    expect(html).toContain('name="description" content="Valaxy 主题云预览"')
  })

  it('keeps only public text in the partially encrypted page description', async () => {
    const html = await fs.readFile(resolve(demoYunDistFolder, 'posts/encrypted-part-post.html'), 'utf8')
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
    expect(description).toContain('中间未被加密的内容')
    expect(description).not.toContain('frontmatter')
    expect(description).not.toContain('This should not be encrypted.')
  })
})
