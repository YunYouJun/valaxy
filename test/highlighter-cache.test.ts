import type { MarkdownOptions, ThemeOptions } from '../packages/valaxy/node/plugins/markdown/types'
import { afterEach, describe, expect, it } from 'vitest'
import { disposeSharedHighlighter, getSharedHighlighter } from '../packages/valaxy/node/plugins/markdown/highlighterCache'

const logger = { warn() {} }

afterEach(() => {
  disposeSharedHighlighter()
})

describe('shared markdown highlighter', () => {
  it('isolates highlighters with different configurations', async () => {
    const firstTheme = { light: 'github-light', dark: 'github-dark' } as ThemeOptions
    const secondTheme = { light: 'vitesse-light', dark: 'vitesse-dark' } as ThemeOptions
    const firstOptions = { theme: firstTheme } as MarkdownOptions
    const secondOptions = { theme: secondTheme } as MarkdownOptions

    const [first, releaseFirst] = await getSharedHighlighter(firstTheme, firstOptions, logger)
    const [second, releaseSecond] = await getSharedHighlighter(secondTheme, secondOptions, logger)

    expect(first).not.toBe(second)

    releaseFirst()
    releaseSecond()
  })

  it('shares concurrent initialization for the same configuration', async () => {
    const theme = { light: 'github-light', dark: 'github-dark' } as ThemeOptions
    const options = { theme } as MarkdownOptions

    const [[first, releaseFirst], [second, releaseSecond]] = await Promise.all([
      getSharedHighlighter(theme, options, logger),
      getSharedHighlighter(theme, options, logger),
    ])

    expect(first).toBe(second)

    releaseFirst()
    releaseFirst()
    releaseSecond()
  })
})
