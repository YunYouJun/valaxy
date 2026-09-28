import { decode } from 'js-base64'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mermaidMarkdown } from '../packages/valaxy-addon-mermaid/node/markdown'
import { logger } from '../packages/valaxy/node/logger'
import { mermaidMigrationPlugin } from '../packages/valaxy/node/plugins/markdown/plugins/mermaidMigration'
import { createMarkdownEngine } from '../packages/valaxy/node/plugins/markdown/renderer'
import { setupMarkdownPlugins } from '../packages/valaxy/node/plugins/markdown/setup'

afterEach(() => vi.restoreAllMocks())

function renderer(enabled = false) {
  const md = createMarkdownEngine({ html: true })
  md.use(mermaidMigrationPlugin)
  if (enabled)
    md.use(mermaidMarkdown)
  return md
}

describe('optional Mermaid integration', () => {
  it('keeps legacy fence options through the full Markdown plugin stack', async () => {
    const md = createMarkdownEngine({ html: true })
    await setupMarkdownPlugins(md)
    md.use(mermaidMarkdown)
    const output = await md.renderAsync('```mermaid {theme: \'forest\', scale: 0.5}\ngraph TD; A-->B\n```', { id: '/pages/chart.md' })
    expect(output).toContain('<ValaxyMermaid')
    expect(output).toContain('scale: 0.5')
    expect(output).toContain('forest')
  })
  it('keeps source readable and gives one actionable migration notice', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const md = renderer()
    const output = await md.renderAsync('```mermaid\ngraph TD\nA[<script>] --> B\n```', { id: '/pages/chart.md' })
    await md.renderAsync('```mermaid\ngraph TD; B-->C\n```')
    expect(output).toContain('&lt;script&gt;')
    expect(output).not.toContain('<ValaxyMermaid')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0][0]).toContain('/pages/chart.md')
    expect(warn.mock.calls[0][0]).toContain('pnpm add valaxy-addon-mermaid')
    expect(warn.mock.calls[0][0]).toContain('addons: [addonMermaid()]')
  })

  it('does not warn about ordinary posts, inline text, or quoted code examples', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const md = renderer()
    await md.renderAsync('Mention `mermaid` here.\n\n````md\n```mermaid\ngraph TD; A-->B\n```\n````')
    expect(warn).not.toHaveBeenCalled()
  })

  it('renders enabled fences with legacy options and lossless encoded source', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const source = 'graph TD\nA[你好] --> B["world"]'
    const html = await renderer(true).renderAsync(`\`\`\`mermaid {theme: 'forest', scale: 0.5}\n${source}\n\`\`\``, { id: '/pages/chart.md' })
    expect(html).toContain('<ValaxyMermaid')
    expect(decode(/code="([^"]+)"/.exec(html)![1])).toBe(source)
    expect(html).toContain('scale: 0.5')
    expect(warn).not.toHaveBeenCalled()
  })

  it('supports longer fences, tildes, and diagrams inside lists', async () => {
    const md = renderer(true)
    for (const text of ['```mermaid{scale: 0.5}\ngraph TD; A-->B\n```', '~~~~mermaid\ngraph TD; A-->B\n~~~~', '````mermaid\ngraph TD; A-->B\n````', '- Chart\n\n  ```mermaid\n  graph TD; A-->B\n  ```']) {
      expect(await md.renderAsync(text, { id: '/pages/chart.md' })).toContain('<ValaxyMermaid')
    }
  })

  it('does not turn fenced tutorials into components', async () => {
    const output = await renderer(true).renderAsync('````txt\n```mermaid\ngraph TD; A-->B\n```\n````', { id: '/pages/tutorial.md' })
    expect(output).not.toContain('<ValaxyMermaid')
    expect(output).toContain('```mermaid')
  })

  it('preserves readable source in feeds and excerpts without Vue', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const output = await renderer(true).renderAsync('```mermaid\ngraph TD; A-->B\n```')
    expect(output).toContain('<pre><code')
    expect(output).not.toContain('<ValaxyMermaid')
    expect(warn).not.toHaveBeenCalled()
  })

  it('preserves async highlighting for other languages', async () => {
    const md = renderer(true)
    md.options.highlight = async source => `<pre>${source}</pre>`
    const output = await md.renderAsync('```ts\nconst x = 1\n```')
    expect(output).toContain('const x = 1')
    expect(output).not.toContain('[object Promise]')
  })
})
