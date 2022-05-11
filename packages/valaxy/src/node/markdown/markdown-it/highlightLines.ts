// Modified from https://github.com/egoist/markdown-it-highlight-lines
import type MarkdownIt from 'markdown-it'

const wrapperRE = /^<pre .*?><code>/

export const highlightLinePlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, options] = args
    const token = tokens[idx]

    // due to use of markdown-it-attrs, the {0} syntax would have been converted
    // to attrs on the token
    const attr = token.attrs && token.attrs[0]
    if (!attr)
      return fence(...args)

    const lines = attr[0]
    if (!lines || !/[\d,-]+/.test(lines))
      return fence(...args)

    const lineNumbers = lines
      .split(',')
      .map(v => v.split('-').map(v => parseInt(v, 10)))

    const code = options.highlight
      ? options.highlight(token.content, token.info, '')
      : token.content

    const rawCode = code.replace(wrapperRE, '')
    const highlightLinesCode = rawCode
      .split('\n')
      .map((split, index) => {
        const lineNumber = index + 1
        const inRange = lineNumbers.some(([start, end]) => {
          if (start && end)
            return lineNumber >= start && lineNumber <= end

          return lineNumber === start
        })
        if (inRange)
          return '<div class="highlighted">&nbsp;</div>'

        return '<br>'
      })
      .join('')

    const highlightLinesWrapperCode = `<div class="highlight-lines">${highlightLinesCode}</div>`

    return highlightLinesWrapperCode + code
  }
}

// markdown-it plugin for wrapping <pre> ... </pre>.
//
// If your plugin was chained before preWrapper, you can add additional element directly.
// If your plugin was chained after preWrapper, you can use these slots:
//   1. <!--beforebegin-->
//   2. <!--afterbegin-->
//   3. <!--beforeend-->
//   4. <!--afterend-->
export const preWrapperPlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]
    const rawCode = fence(...args)
    return `<div class="language-${token.info.trim()}">${rawCode}</div>`
  }
}

// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.
export const lineNumberPlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args)
    const code = rawCode.slice(
      rawCode.indexOf('<code>'),
      rawCode.indexOf('</code>'),
    )

    const lines = code.split('\n')
    const lineNumbersCode = [...Array(lines.length - 1)]
      .map((line, index) => `<span class="line-number">${index + 1}</span><br>`)
      .join('')

    const lineNumbersWrapperCode = `<div class="line-numbers-wrapper">${lineNumbersCode}</div>`

    const finalCode = rawCode
      .replace(/<\/div>$/, `${lineNumbersWrapperCode}</div>`)
      .replace(/"(language-\w+)"/, '"$1 line-numbers-mode"')

    return finalCode
  }
}
