// ref vitepress/packages/vitepress/src/node/markdown/plugins/preWrapper.ts
import type MarkdownIt from 'markdown-it'
import type { SiteConfig } from 'valaxy/types'
import type { ThemeOptions } from '../../types'

export interface Options {
  theme: ThemeOptions
  siteConfig?: SiteConfig
}

export function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, '')
    .replace(/:(no-)?line-numbers({| |$|=\d*).*/, '')
    .replace(/(-vue|{| ).*$/, '')
    .replace(/^vue-html$/, 'template')
    .replace(/^ansi$/, '')
}

export function getAdaptiveThemeMarker(options: Options) {
  const { theme } = options
  const hasSingleTheme = typeof theme === 'string' || 'name' in theme
  let marker = ''
  if (hasSingleTheme) {
    marker = ' va-adaptive-theme'
    const themeName = typeof theme === 'string' ? theme : theme.name
    const isDark = themeName.includes('dark') || themeName.includes('night')
    marker = isDark ? ' dark' : ' light'
  }
  return marker
}

export function extractTitle(info: string, html = false) {
  if (html) {
    return (
      info.replace(/<!--[^]*?-->/g, '').match(/data-title="(.*?)"/)?.[1] || ''
    )
  }
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

function getCodeHeightLimitStyle(options: Options) {
  const codeHeightLimit = options?.siteConfig?.codeHeightLimit
  if (codeHeightLimit === undefined || codeHeightLimit <= 0)
    return ''

  return `style="max-height: ${codeHeightLimit}px;"`
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
    const [tokens, idx] = args
    const token = tokens[idx]
    // remove title from info
    token.info = token.info.replace(/\[.*\]/, '')

    const lang = extractLang(token.info)
    const rawCode = fence(...args)

    return `
    <div ${getCodeHeightLimitStyle(options)} class="language-${lang}${getAdaptiveThemeMarker(options)}${
      / active( |$)/.test(token.info) ? ' active' : ''
    }">
      <button title="Copy Code" class="copy"></button><span class="lang">${lang}</span>${rawCode}<button class="collapse"></button>
    </div>`
  }
}
