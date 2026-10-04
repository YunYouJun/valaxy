import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'

interface BraceNode {
  type: string
  value?: string
  nodes?: BraceNode[]
  parent?: BraceNode
}

function dependency(entry: URL, chain: string[]) {
  let require = createRequire(entry)
  for (const name of chain)
    require = createRequire(require.resolve(name))
  return require
}

// Resolve through the actual consumers so a patch applied to an unused copy
// cannot make these regressions pass.
const consumers = [
  ['Stylelint', dependency(new URL(import.meta.url), ['stylelint', 'micromatch'])],
  ['gh-pages', dependency(new URL('../packages/valaxy/package.json', import.meta.url), ['gh-pages', 'globby', 'fast-glob', 'micromatch'])],
] as const

describe.each(consumers)('%s brace pattern security', (_, require) => {
  const braces = require('braces')

  it.each(['parse', 'compile', 'expand', 'stringify'])('bounds nesting in %s before exhausting the stack', (method) => {
    for (const [open, close] of [['{', '}'], ['(', ')'], ['{(', ')}']]) {
      const pattern = `${open.repeat(2000)}a,b${close.repeat(2000)}`
      expect(pattern.length).toBeLessThan(10000)
      expect(() => braces[method](pattern)).toThrow(/exceeds max depth/)
    }
  })

  it.each(['compile', 'expand', 'stringify'])('guards direct AST input to %s', (method) => {
    let ast: BraceNode = { type: 'text', value: 'a' }
    for (let i = 0; i < 4000; i++)
      ast = { type: 'brace', nodes: [ast] }
    ast = { type: 'root', nodes: [ast] }
    expect(() => braces[method](ast)).toThrow(/exceeds max depth/)
  })

  it('cannot disable the depth ceiling with an oversized or non-finite option', () => {
    const pattern = `${'{'.repeat(101)}a,b${'}'.repeat(101)}`
    for (const maxDepth of [10000, Infinity, Number.NaN])
      expect(() => braces.compile(pattern, { maxDepth })).toThrow(/exceeds max depth/)
    expect(() => braces.parse('{{a,b},c}', { maxDepth: 1 })).toThrow(/exceeds max depth/)
    expect(() => braces.parse('{{a,b},c}', { maxDepth: 2 })).not.toThrow()
  })

  it('rejects cyclic AST parents without hanging', () => {
    const ast: BraceNode = { type: 'paren', nodes: [{ type: 'text', value: 'a' }] }
    ast.parent = ast
    expect(() => runInNewContext('braces.expand(ast)', { braces, ast }, { timeout: 1000 }))
      .toThrow(/parent chain contains a cycle/)
  })

  it('preserves alternatives, ranges, parentheses and literal escaping', () => {
    expect(braces.expand('a{1..3}b{c,d}')).toEqual(['a1bc', 'a1bd', 'a2bc', 'a2bd', 'a3bc', 'a3bd'])
    expect(braces.expand('{a,b{1..2}}')).toEqual(['a', 'b1', 'b2'])
    expect(braces.expand('foo/({a,b})')).toEqual(['foo/(a)', 'foo/(b)'])
    expect(braces.compile('**/*.{css,scss,vue}')).toBe('**/*.(css|scss|vue)')
    expect(braces.stringify(braces.parse('{a,{b,{c}}}'), { escapeInvalid: true })).toBe('{a,{b,{c}}}')
  })
})

it('retains Stylelint file discovery, exclusions and lint diagnostics', async () => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-stylelint-'))
  try {
    await writeFile(join(root, 'good.css'), 'a { color: red; }\n')
    await writeFile(join(root, 'bad.scss'), 'a { unknown-property: 0; }\n')
    await writeFile(join(root, 'ignored.css'), 'a { unknown-property: 0; }\n')
    const result = await stylelint.lint({
      cwd: root,
      files: ['*.{css,scss}', '!ignored.css'],
      config: { rules: { 'property-no-unknown': true } },
    })
    expect(result.errored).toBe(true)
    expect(result.results).toHaveLength(2)
    expect(result.results.find(file => file.source?.endsWith('good.css'))?.warnings).toEqual([])
    expect(result.results.find(file => file.source?.endsWith('bad.scss'))?.warnings)
      .toEqual([expect.objectContaining({ rule: 'property-no-unknown', severity: 'error' })])
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
