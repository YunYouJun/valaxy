// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.

import type MarkdownIt from 'markdown-it'
import { isPromiseLike } from '../async-utils'

function processLineNumbers(rawCode: string, startLineNumber: number): string {
  const code = rawCode.slice(
    rawCode.indexOf('<code>'),
    rawCode.indexOf('</code>'),
  )

  const lines = code.split('\n')

  const lineNumbersCode = Array.from(Array.from({ length: lines.length }), (_, index) => `<span class="line-number">${index + startLineNumber}</span><br>`)
    .join('')

  const lineNumbersWrapperCode = `<div class="line-numbers-wrapper" aria-hidden="true">${lineNumbersCode}</div>`

  return rawCode
    .replace(/<\/div>$/, `${lineNumbersWrapperCode}</div>`)
    .replace(/"(language-[^"]*)"/, '"$1 line-numbers-mode"')
}

export function lineNumberPlugin(md: MarkdownIt, enable = false) {
  const fence = md.renderer.rules.fence!
  // markdown-exit's fence rule may return Promise<string> for async highlight.
  // Type-assert because markdown-it's RenderRule type doesn't account for this.
  md.renderer.rules.fence = ((...args: Parameters<typeof fence>) => {
    const rawCode = fence(...args)

    const [tokens, idx] = args
    const info = tokens[idx].info

    if (
      // eslint-disable-next-line regexp/no-unused-capturing-group
      (!enable && !/:line-numbers($| |=)/.test(info))
      // eslint-disable-next-line regexp/no-unused-capturing-group
      || (enable && /:no-line-numbers($| )/.test(info))
    ) {
      return rawCode
    }

    let startLineNumber = 1
    const matchStartLineNumber = info.match(/=(\d*)/)
    if (matchStartLineNumber && matchStartLineNumber[1])
      startLineNumber = Number.parseInt(matchStartLineNumber[1])

    // Support async fence results from markdown-exit with async highlight
    return isPromiseLike(rawCode)
      ? (rawCode as unknown as Promise<string>).then(code => processLineNumbers(code, startLineNumber))
      : processLineNumbers(rawCode as string, startLineNumber)
  }) as typeof fence
}
