import { getHighlighter } from 'shiki'
import consola from 'consola'
import type { ThemeOptions } from '../markdown'

export async function highlight(theme: ThemeOptions = 'material-palenight') {
  const themes = typeof theme === 'string' ? [theme] : [theme.dark, theme.light]
  const highlighter = await getHighlighter({ themes })
  const preRE = /^<pre.*?>/

  return (str: string, lang: string) => {
    lang = lang || 'text'

    // https://stackoverflow.com/questions/22268952/what-is-the-difference-between-yaml-and-yml-extension
    // use yaml better

    // adaptive
    if (lang === 'yml') {
      lang = 'yaml'
      consola.warn('[shiki] It is recommended to use `.yaml` instead of `.yml`.')
    }

    if (typeof theme === 'string') {
      return highlighter
        .codeToHtml(str, { lang, theme })
        .replace(preRE, '<pre v-pre>')
    }

    const dark = highlighter
      .codeToHtml(str, { lang, theme: theme.dark })
      .replace(preRE, '<pre v-pre class="va-code-dark">')

    const light = highlighter
      .codeToHtml(str, { lang, theme: theme.light })
      .replace(preRE, '<pre v-pre class="va-code-light">')

    return dark + light
  }
}
