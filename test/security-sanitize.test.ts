import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import type { PageData } from '../packages/valaxy/types'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { parse as parseSfc } from 'vue/compiler-sfc'
import { containerPlugin } from '../packages/valaxy/node/plugins/markdown/plugins/markdown-it/container'
import { createTransformEncrypt } from '../packages/valaxy/node/plugins/markdown/transform/encrypt'
import { writeRedirectFiles } from '../packages/valaxy/node/utils/clientRedirects'
import { escapeHtml, sanitizeUrl, serializeInlineJsString } from '../packages/valaxy/shared'

describe('shared sanitization helpers', () => {
  it('blocks unsafe URL schemes and control-character obfuscations while allowing safe URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#')
    expect(sanitizeUrl('  JaVaScRiPt:alert(1)')).toBe('#')
    expect(sanitizeUrl('java\nscript:alert(1)')).toBe('#')
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#')
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
    expect(sanitizeUrl('https://valaxy.site/posts/hello?a=1#sec')).toBe('https://valaxy.site/posts/hello?a=1#sec')
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
    expect(sanitizeUrl('/posts/foo:bar')).toBe('/posts/foo:bar')
    expect(sanitizeUrl('data:image/svg+xml,<svg/>', '', { allowDataImage: true })).toBe('data:image/svg+xml,<svg/>')
    expect(sanitizeUrl('data:text/html,hi', '', { allowDataImage: true })).toBe('')
  })

  it('escapes HTML characters and serializes inline JS strings safely', () => {
    expect(escapeHtml(`<img src="x" onerror='alert(1)'> & more`)).toBe('&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt; &amp; more')
    expect(serializeInlineJsString(`'</script>&"`)).toBe('"\\u0027\\u003c\\u002fscript\\u003e\\u0026\\""')
  })
})

describe('writeRedirectFiles', () => {
  it('sanitizes unsafe destinations and escapes quotes/script tags', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'valaxy-redirect-'))
    try {
      const unsafeFile = join(dir, 'unsafe.html')
      await writeRedirectFiles('javascript:alert(1)', unsafeFile)
      const unsafeHtml = await readFile(unsafeFile, 'utf8')
      expect(unsafeHtml).not.toContain('javascript:alert(1)')
      expect(unsafeHtml).toContain('content="0; url=/"')

      const quotedFile = join(dir, 'quoted.html')
      await writeRedirectFiles(`/posts/'</script>"?a=1`, quotedFile)
      const quotedHtml = await readFile(quotedFile, 'utf8')
      expect(quotedHtml).toContain('content="0; url=/posts/&#39;&lt;/script&gt;&quot;?a=1"')
      expect(quotedHtml).not.toContain(`window.location.href = '/posts/'</script>`)
      expect(quotedHtml).toContain('\\u0027\\u003c\\u002fscript\\u003e')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('createTransformEncrypt', () => {
  it('escapes password_hint attributes, slices template/script setup cleanly, and prevents $-pattern corruption', async () => {
    const transform = createTransformEncrypt({
      config: {
        siteConfig: {
          encrypt: {
            enable: true,
            iv: new Uint8Array(16),
            salt: new Uint8Array(16),
          },
        },
      },
    } as ResolvedValaxyOptions)

    const pageData = {
      frontmatter: {
        password: 'secret',
        password_hint: 'Use "$&" <tag>',
      },
    } as unknown as PageData

    const input = [
      '<template><div class="secret">Secret body</div></template>',
      '<script setup lang="ts">const leak = "top-secret"</script>',
      '<script>export const meta = 1</script>',
    ].join('\n')

    const output = await transform(input, '/posts/secret.md', pageData)
    expect(output).toContain('hint="Use &quot;$&amp;&quot; &lt;tag&gt;"')
    expect(output).not.toContain('Secret body')
    expect(output).not.toContain('top-secret')
    expect(output).toContain('<script setup lang="ts"></script>')
    expect(output).toContain('<script>export const meta = 1</script>')
  })

  it('strips only the top-level script setup block even when script-setup tags appear inside frontmatter strings or comments', async () => {
    const transform = createTransformEncrypt({
      config: {
        siteConfig: {
          encrypt: {
            enable: true,
            iv: new Uint8Array(16),
            salt: new Uint8Array(16),
          },
        },
      },
    } as ResolvedValaxyOptions)

    const pageData = {
      frontmatter: {
        password: 'secret',
        password_hint: 'Use <script setup lang="ts">',
      },
    } as unknown as PageData

    const input = [
      '<template><div class="secret">Private body</div></template>',
      '<script setup>',
      'const frontmatter = {"description":"Use <script setup lang=\\"ts\\">"}',
      'window.privateData = "PRIVATE_SENTINEL"',
      '// <script setup lang="ts">',
      '</script>',
    ].join('\n')

    const output = await transform(input, '/posts/tricky-setup.md', pageData)
    const { descriptor, errors } = parseSfc(output, { filename: 'tricky-setup.vue' })

    expect(errors).toEqual([])
    expect(output).toContain('hint="Use &lt;script setup lang=&quot;ts&quot;&gt;"')
    expect(output).not.toContain('PRIVATE_SENTINEL')
    expect(descriptor.scriptSetup?.content ?? '').toBe('')
  })
})

describe('containerPlugin code-group tab titles', () => {
  it('escapes HTML and adds v-pre on tab labels', () => {
    const md = new MarkdownIt()
    md.use((instance) => {
      containerPlugin(instance as any)
    })

    const html = md.render([
      '::: code-group',
      '```ts [<img onerror=alert(1)> {{ count }}]',
      'const a = 1',
      '```',
      ':::',
    ].join('\n'))

    expect(html).toContain('<label v-pre data-title="&lt;img onerror=alert(1)&gt; {{ count }}"')
    expect(html).toContain('>&lt;img onerror=alert(1)&gt; {{ count }}</label>')
  })

  it('decodes HTML entities in html_block data-title before re-escaping so entities are not double-escaped', () => {
    const md = new MarkdownIt({ html: true })
    md.use((instance) => {
      containerPlugin(instance as any)
    })

    const html = md.render([
      '::: code-group',
      '<div class="language-ts" data-title="A &amp; B &#x27;C&#39; &quot;D&quot;"><pre><code>const a = 1</code></pre></div>',
      '',
      '<div class="language-ts" data-title="&lt;img onerror=alert(1)&gt;"><pre><code>const b = 2</code></pre></div>',
      '',
      '<div class="language-ts" data-title="&constructor; &Amp;"><pre><code>const c = 3</code></pre></div>',
      ':::',
    ].join('\n'))

    expect(html).toContain('<label v-pre data-title="A &amp; B \'C\' &quot;D&quot;" for="tab-1">A &amp; B \'C\' &quot;D&quot;</label>')
    expect(html).toContain('<label v-pre data-title="&lt;img onerror=alert(1)&gt;" for="tab-2">&lt;img onerror=alert(1)&gt;</label>')
    expect(html).toContain('<label v-pre data-title="&amp;constructor; &amp;Amp;" for="tab-3">&amp;constructor; &amp;Amp;</label>')
    expect(html).not.toContain('&amp;amp;')
    expect(html).not.toContain('function Object()')
  })
})
