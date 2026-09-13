// ref vitepress

// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. normalize internal links to end with `.html`

import type { MarkdownBaseResolver } from '../base'
import type { MarkdownEnv } from '../env'
import type { MarkdownRenderer } from '../renderer'
import { URL } from 'node:url'
import { EXTERNAL_URL_RE } from '../../../../shared'
import { PATHNAME_PROTOCOL_RE } from '../../../constants'

const indexRE = /(^|.*\/)index.md(.*)$/i

export function linkPlugin(md: MarkdownRenderer, externalAttrs: Record<string, string>, resolveBase: MarkdownBaseResolver) {
  md.renderer.rules.link_open = (
    tokens,
    idx,
    options,
    env,
    self,
  ) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs![hrefIndex]
      let url = String(hrefAttr[1])
      const isExternal = EXTERNAL_URL_RE.test(url)
      if (isExternal) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          token.attrSet(key, val)
        })

        url = url.replace(PATHNAME_PROTOCOL_RE, '')
      }
      else {
        if (
          // internal anchor links
          !url.startsWith('#')
          // mail links
          && !url.startsWith('mailto:')
          // links to files (other than html/md)
          // eslint-disable-next-line regexp/no-unused-capturing-group
          && !/\.(?!html|md)\w+($|[?#])/i.test(url)
        ) {
          url = normalizeHref(url, (env ?? {}) as MarkdownEnv)
        }

        // Append Vite's resolved base to every root-absolute Markdown link,
        // including links to public files such as PDFs.
        if (url.startsWith('/'))
          url = `${resolveBase()}${url}`.replace(/\/+/g, '/')
      }

      // encode vite-specific replace strings in case they appear in URLs
      // this also excludes them from build-time replacements (which injects
      // <wbr/> and will break URLs)
      hrefAttr[1] = url
        .replace(/\bimport\.meta/g, 'import%2Emeta')
        .replace(/\bprocess\.env/g, 'process%2Eenv')
    }
    return self.renderToken(tokens, idx, options)
  }

  function normalizeHref(url: string, env: MarkdownEnv): string {
    const indexMatch = url.match(indexRE)
    if (indexMatch) {
      const [, path, hash] = indexMatch
      url = path + hash
    }
    else {
      let cleanUrl = url.replace(/[?#].*$/, '')
      // transform foo.md -> foo[.html]
      if (cleanUrl.endsWith('.md')) {
        cleanUrl = cleanUrl.replace(
          /\.md$/,
          env.cleanUrls === 'disabled' ? '.html' : '',
        )
      }
      // transform ./foo -> ./foo[.html]
      if (
        env.cleanUrls === 'disabled'
        && !cleanUrl.endsWith('.html')
        && !cleanUrl.endsWith('/')
      ) {
        cleanUrl += '.html'
      }

      const parsed = new URL(url, 'http://a.com')
      url = cleanUrl + parsed.search + parsed.hash
    }

    // ensure leading . for relative paths
    if (!url.startsWith('/') && !/^\.\//.test(url))
      url = `./${url}`

    // export it for existence check
    pushLink(url.replace(/\.html$/, ''), env)

    // markdown-it encodes the uri
    return decodeURI(url)
  }

  function pushLink(link: string, env: MarkdownEnv) {
    const links = env.links || (env.links = [])
    links.push(link)
  }
}
