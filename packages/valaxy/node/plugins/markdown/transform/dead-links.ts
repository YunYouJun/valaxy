import type { ResolvedValaxyOptions } from '../../../options'
import type { MarkdownCompileResult } from '../types'
import { slash } from '@antfu/utils'
import fs from 'fs-extra'
import path from 'pathe'
import { EXTERNAL_URL_RE } from '../../../../shared'
import { Valaxy } from '../../../app'
import { treatAsHtml } from '../utils'

export function createScanDeadLinks(options: ResolvedValaxyOptions) {
  const srcDir = path.resolve(options.userRoot, 'pages')
  const { ignoreDeadLinks } = options.config.build
  const publicDir = options.config.vite?.publicDir || 'public'

  return (code: string, id: string) => {
    const fileInfo = Valaxy.state.idMap.get(id)
    const { links = [] } = fileInfo || {}
    const fileOrig = id
    const file = id

    // validate data.links
    const deadLinks: MarkdownCompileResult['deadLinks'] = []
    const recordDeadLink = (url: string) => {
      deadLinks.push({ url, file: path.relative(srcDir, fileOrig) })
    }

    function shouldIgnoreDeadLink(url: string) {
      if (!ignoreDeadLinks)
        return false

      if (ignoreDeadLinks === true)
        return true

      if (ignoreDeadLinks === 'localhostLinks')
        return url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost')

      return ignoreDeadLinks.some((ignore) => {
        if (typeof ignore === 'string')
          return url === ignore

        if (ignore instanceof RegExp)
          return ignore.test(url)

        if (typeof ignore === 'function')
          return ignore(url)

        return false
      })
    }

    if (links) {
      const dir = path.dirname(file)
      for (let url of links) {
        const { pathname } = new URL(url, 'http://a.com')
        if (!treatAsHtml(pathname))
          continue

        url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
        if (url.endsWith('/'))
          url += `index`
        const resolved = decodeURIComponent(
          slash(
            url.startsWith('/')
              ? url.slice(1)
              : path.relative(srcDir, path.resolve(dir, url)),
          ),
        // /index => /
        ).replace(/\/index$/, '')
        if (
          !options.pages.includes(resolved)
          && !fs.existsSync(path.resolve(dir, publicDir, `${resolved}.html`))
          && !shouldIgnoreDeadLink(url)
        ) {
          recordDeadLink(url)
        }
      }
    }

    return deadLinks
  }
}
