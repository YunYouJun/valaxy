// ref vitepress/packages/vitepress/src/node/markdown/plugins/preWrapper.ts
import type MarkdownIt from 'markdown-it'
import type { SiteConfig } from '../../../../../types'
import type { MarkdownEnv } from '../../env'

export interface Options {
  codeCopyButtonTitle: string
  siteConfig?: SiteConfig
}

export function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, '')
    // eslint-disable-next-line regexp/optimal-quantifier-concatenation
    .replace(/:(no-)?line-numbers(\{| |$|=\d*).*/, '')
    .replace(/(-vue|\{| ).*$/, '')
    .replace(/^vue-html$/, 'template')
    .replace(/^ansi$/, '')
}

export function extractTitle(info: string, html = false) {
  if (html) {
    return (
      info.replace(/<!--[\s\S]*?-->/g, '').match(/data-title="(.*?)"/)?.[1] || ''
    )
  }
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

function getCodeHeightLimitStyle(options: Options, env: MarkdownEnv) {
  // frontmatter has higher priority
  const codeHeightLimit = env.frontmatter?.codeHeightLimit || options?.siteConfig?.codeHeightLimit
  if (codeHeightLimit === undefined || codeHeightLimit <= 0)
    return ''

  return ` max-h-${codeHeightLimit}px`
}

// markdown-it plugin for wrapping <pre> ... </pre>.
//
// If your plugin was chained before preWrapper, you can add additional element directly.
// If your plugin was chained after preWrapper, you can use these slots:
//   1. <!--beforebegin-->
//   2. <!--afterbegin-->
//   3. <!--beforeend-->
//   4. <!--afterend-->
export function preWrapperPlugin(md: MarkdownIt, options: Options) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, _, env] = args
    const token = tokens[idx]
    // remove title from info
    token.info = token.info.replace(/\[.*\]/, '')

    // eslint-disable-next-line regexp/no-unused-capturing-group
    const active = / active( |$)/.test(token.info) ? ' active' : ''
    token.info = token.info.replace(/ active$/, '').replace(/ active /, ' ')

    const lang = extractLang(token.info)
    const rawCode = fence(...args)

    const codeHeightLimitClass = getCodeHeightLimitStyle(options, env)

    return (
      `<div class="language-${lang}${active}${codeHeightLimitClass}">`
      + `<button title="${options.codeCopyButtonTitle || 'Copy code'}" class="copy"></button>`
      + `<span class="lang">${lang}</span>`
      + `${rawCode}`
      + '<button class="collapse"></button>'
      + '</div>'
    )
  }
}
