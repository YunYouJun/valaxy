import { describe, expect, it } from 'vitest'
import { extractCodeBlockTitles } from '../packages/valaxy/node/utils/groupIcons'

describe('extractCodeBlockTitles', () => {
  it('extracts title from fenced code block', () => {
    const md = '```ts [filename.ts]\nconsole.log("hello")\n```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual(['filename.ts'])
  })

  it('extracts multiple titles', () => {
    const md = [
      '```ts [app.ts]',
      'const a = 1',
      '```',
      '',
      '```vue [App.vue]',
      '<template></template>',
      '```',
    ].join('\n')
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('app.ts')
    expect([...titles]).toContain('App.vue')
  })

  it('extracts titles from code groups', () => {
    const md = [
      '::: code-group',
      '```sh [pnpm]',
      'pnpm install',
      '```',
      '```sh [npm]',
      'npm install',
      '```',
      ':::',
    ].join('\n')
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('pnpm')
    expect([...titles]).toContain('npm')
  })

  it('ignores code blocks without titles', () => {
    const md = '```ts\nconst a = 1\n```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual([])
  })

  it('handles titles with dots (file extensions)', () => {
    const md = [
      '```json [package.json]',
      '{}',
      '```',
      '```yaml [docker-compose.yml]',
      'version: "3"',
      '```',
    ].join('\n')
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('package.json')
    expect([...titles]).toContain('docker-compose.yml')
  })

  it('handles titles with special characters', () => {
    const md = '```ts [valaxy.config.ts]\nexport default {}\n```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('valaxy.config.ts')
  })

  it('deduplicates identical titles', () => {
    const md = [
      '```ts [config.ts]',
      'const a = 1',
      '```',
      '',
      '```ts [config.ts]',
      'const b = 2',
      '```',
    ].join('\n')
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual(['config.ts'])
  })

  it('accumulates into existing Set', () => {
    const existing = new Set(['existing.ts'])
    const md = '```ts [new.ts]\n```'
    const titles = extractCodeBlockTitles(md, existing)
    expect([...titles]).toContain('existing.ts')
    expect([...titles]).toContain('new.ts')
  })

  it('handles quadruple backtick fences', () => {
    const md = '````ts [nested.ts]\n```\ninner\n```\n````'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('nested.ts')
  })

  it('does not match [[toc]] after code fence on next line', () => {
    const md = '```\n[[toc]]\n```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual([])
  })

  it('does not match content on the line after a code fence', () => {
    const md = [
      '```ts',
      '[shouldNotMatch.ts]',
      '```',
    ].join('\n')
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual([])
  })

  it('handles code blocks with meta attrs before the title', () => {
    const md = '```ts {7-9} [site.config.ts]\nexport default {}\n```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('site.config.ts')
  })

  it('handles code blocks with meta attrs after the title', () => {
    const md = '```ts [site.config.ts] {7-9}\nexport default {}\n```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toContain('site.config.ts')
  })

  it('extracts title from indented fenced code block (up to 3 spaces)', () => {
    const md = [
      '   ```ts [filename.ts]',
      '   console.log("hello")',
      '   ```',
    ].join('\n')
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual(['filename.ts'])
  })

  it('does not match fence indented more than 3 spaces', () => {
    const md = '    ```ts [filename.ts]\n    code\n    ```'
    const titles = extractCodeBlockTitles(md)
    expect([...titles]).toEqual([])
  })
})
