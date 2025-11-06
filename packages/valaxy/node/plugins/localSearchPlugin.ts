/**
 * @TODO localSearch by minisearch
 */

import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
// import path from 'node:path'
// import { slash } from '@antfu/utils'
// import _debug from 'debug'
// import pMap from 'p-map'

const LOCAL_SEARCH_INDEX_ID = '@localSearchIndex'
const LOCAL_SEARCH_INDEX_REQUEST_PATH = `/${LOCAL_SEARCH_INDEX_ID}`

// const debug = _debug('vitepress:local-search')

export async function localSearchPlugin(
  options: ResolvedValaxyOptions,
): Promise<Plugin> {
  const siteConfig = options.config.siteConfig

  if (siteConfig.search?.provider !== 'local') {
    return {
      name: 'valaxy:local-search',
      resolveId(id) {
        if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
          return LOCAL_SEARCH_INDEX_REQUEST_PATH
        }
      },
      load(id) {
        if (id.startsWith(LOCAL_SEARCH_INDEX_REQUEST_PATH)) {
          return `export default '{}'`
        }
      },
    }
  }

  // let server: ViteDevServer | undefined

  // function onIndexUpdated() {
  //   if (server) {
  //     server.moduleGraph.onFileChange(LOCAL_SEARCH_INDEX_REQUEST_PATH)
  //     // HMR
  //     const mod = server.moduleGraph.getModuleById(
  //       LOCAL_SEARCH_INDEX_REQUEST_PATH,
  //     )
  //     if (!mod)
  //       return
  //     server.ws.send({
  //       type: 'update',
  //       updates: [
  //         {
  //           acceptedPath: mod.url,
  //           path: mod.url,
  //           timestamp: Date.now(),
  //           type: 'js-update',
  //         },
  //       ],
  //     })
  //   }
  // }

  // function getDocId(file: string) {
  //   let relFile = slash(path.relative(siteConfig.srcDir, file))
  //   relFile = siteConfig.rewrites.map[relFile] || relFile
  //   let id = slash(path.join(siteConfig.site.base, relFile))
  //   id = id.replace(/(^|\/)index\.md$/, '$1')
  //   id = id.replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
  //   return id
  // }

  // async function indexFile(page: string) {
  //   const file = path.join(siteConfig.srcDir, page)
  //   // get file metadata
  //   const fileId = getDocId(file)
  //   const locale = getLocaleForPath(siteConfig.site, page)
  //   const index = getIndexByLocale(locale)
  //   // retrieve file and split into "sections"
  //   const html = await render(file)
  //   const sections
  //     // user provided generator
  //     = (await options.miniSearch?._splitIntoSections?.(file, html))
  //     // default implementation
  //       ?? splitPageIntoSections(html)
  //   // add sections to the locale index
  //   for await (const section of sections) {
  //     if (!section || !(section.text || section.titles))
  //       break
  //     const { anchor, text, titles } = section
  //     const id = anchor ? [fileId, anchor].join('#') : fileId
  //     index.add({
  //       id,
  //       text,
  //       title: titles.at(-1)!,
  //       titles: titles.slice(0, -1),
  //     })
  //   }
  // }

  // async function scanForBuild() {
  //   debug('🔍️ Indexing files for search...')
  //   await pMap(siteConfig.pages, indexFile, {
  //     concurrency: siteConfig.buildConcurrency,
  //   })
  //   debug('✅ Indexing finished...')
  // }

  return {
    name: 'valaxy:local-search',
    config: () => {
      return {
        optimizeDeps: {
          include: [
            'valaxy > @vueuse/integrations/useFocusTrap',
            'valaxy > mark.js/src/vanilla.js',
            'valaxy > minisearch',
          ],
        },

        // async configureServer(_server) {
        //   server = _server
        //   await scanForBuild()
        //   onIndexUpdated()
        // },

        // resolveId(id) {
        //   if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
        //     return `/${id}`
        //   }
        // },
      }
    },
  }
}
