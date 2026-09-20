import { expect, it, vi } from 'vitest'
import { highlight } from '../packages/valaxy/node/plugins/markdown/plugins/highlight'

it('reuses identical signatures, retaining language and line highlight distinctions', async () => {
  const tokenize = vi.fn()
  const [render, dispose] = await highlight('github-light', {
    highlightCache: true,
    shikiSetup(shiki) {
      const original = shiki.codeToHtml.bind(shiki)
      shiki.codeToHtml = (...args) => {
        tokenize()
        return original(...args)
      }
    },
  })
  try {
    const source = 'const value = {{ value }}'
    const first = await render(source, 'ts', '')
    expect(await render(source, 'ts', '')).toBe(first)
    expect(tokenize).toHaveBeenCalledTimes(1)
    expect(await render(source, 'ts', '{1}')).toContain('highlighted')
    expect(await render(source, 'ts-vue', '')).not.toContain('v-pre')
    expect(tokenize).toHaveBeenCalledTimes(3)
  }
  finally { dispose() }
})

it('keeps custom transformer side effects uncached by default', async () => {
  const transform = vi.fn((code: string) => code)
  const [render, dispose] = await highlight('github-light', { codeTransformers: [{ postprocess: transform }] })
  try {
    await render('const value = 1', 'ts', '')
    await render('const value = 1', 'ts', '')
    expect(transform).toHaveBeenCalledTimes(2)
  }
  finally { dispose() }
})
