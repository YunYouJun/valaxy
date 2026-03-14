// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.

import type MarkdownIt from 'markdown-it'

function processLineNumbers(rawCode: string, info: string, enable: boolean, startLineNumber: number): string {
  const code = rawCode.slice(
    rawCode.indexOf('<code>'),
    rawCode.indexOf('</code>'),
  )

  const lines = code.split('\n')

  const lineNumbersCode = Array.from(Array.from({ length: lines.length }), (_, index) => `<span class="line-number">${index + startLineNumber}</span><br>`)
    .join('')

  const lineNumbersWrapperCode = `<div class="line-numbers-wrapper" aria-hidden="true">${lineNumbersCode}</div>`

  const finalCode = rawCode
    .replace(/<\/div>$/, `${lineNumbersWrapperCode}</div>`)
    .replace(/"(language-[^"]*)"/, '"$1 line-numbers-mode"')

  return finalCode
}

export function lineNumberPlugin(md: MarkdownIt, enable = false) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
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

    // Handle async fence result (from markdown-exit with async highlight)
    if (typeof rawCode === 'object' && rawCode !== null && typeof (rawCode as any).then === 'function') {
      return (rawCode as unknown as Promise<string>).then(
        code => processLineNumbers(code, info, enable, startLineNumber),
      )
    }

    return processLineNumbers(rawCode as string, info, enable, startLineNumber)
  }
}
