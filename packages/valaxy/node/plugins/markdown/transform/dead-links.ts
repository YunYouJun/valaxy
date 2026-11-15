import type { ResolvedValaxyOptions } from '../../../types'
import type { MarkdownCompileResult, MarkdownTransformContext } from '../types'
import { slash } from '@antfu/utils'
import fs from 'fs-extra'
import path from 'pathe'
import { EXTERNAL_URL_RE, safeDecodeURIComponent, safeParseUrl } from '../../../../shared'
import { resolvePublicDir } from '../../../utils/buildConfig'
import { getPagePath, pagePathToRoute, resolvePageFile } from '../../../utils/pageSources'
import { treatAsHtml } from '../utils'

function isInsideDir(baseDir: string, targetPath: string): boolean {
  const rel = path.relative(baseDir, targetPath)
  return rel !== '..' && !rel.startsWith('../') && !path.isAbsolute(rel)
}

export function createScanDeadLinks(options: ResolvedValaxyOptions) {
  const srcDir = path.resolve(options.userRoot, 'pages')
  const { ignoreDeadLinks } = options.config.build
  const publicDir = resolvePublicDir(
    options.userRoot,
    options.publicDir !== undefined ? options.publicDir : options.config.vite?.publicDir,
  )

  return (code: string, context: MarkdownTransformContext) => {
    const { id, fileInfo } = context
    const { links = [] } = fileInfo || {}
    const fileOrig = id
    const file = id
    const logicalFile = getPagePath(file, options.userRoot) || path.relative(srcDir, file)
    const routes = new Set(options.pages.map(pagePathToRoute))

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
      for (let url of links) {
        const parsed = safeParseUrl(url, 'http://a.com')
        if (!parsed || !treatAsHtml(parsed.pathname))
          continue

        url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
        if (url.endsWith('/'))
          url += `index`
        const resolved = safeDecodeURIComponent(
          slash(
            url.startsWith('/')
              ? url.slice(1)
              : path.normalize(path.join(path.dirname(logicalFile), url)),
          ),
        // /index => /
        ).replace(/(^|\/)index$/, '')
        const publicCandidate = publicDir ? path.resolve(publicDir, `${resolved}.html`) : null
        if (
          !routes.has(resolved)
          // The content inventory contains Markdown only; Vue pages also
          // provide valid routes, including directory index pages.
          && !resolvePageFile(`${resolved}.vue`, options.userRoot)
          && !resolvePageFile(path.join(resolved, 'index.vue'), options.userRoot)
          && !(publicDir && publicCandidate && isInsideDir(publicDir, publicCandidate) && fs.existsSync(publicCandidate))
          && !shouldIgnoreDeadLink(url)
        ) {
          recordDeadLink(url)
        }
      }
    }

    return deadLinks
  }
}
