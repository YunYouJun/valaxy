import type { MomentsOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

function isMomentsIndex(path: string) {
  return path === '/moments' || path === '/moments/'
}

function isMomentEntry(path: string) {
  return path.startsWith('/moments/') && !isMomentsIndex(path)
}

export function shouldExcludeMoment(data: Readonly<Record<string, unknown>>, mode: 'build' | 'dev') {
  return mode === 'build' && (Boolean(data.draft) || Boolean(data.hide))
}

export const addonMoments = defineValaxyAddon<MomentsOptions>((options = {}) => ({
  name: pkg.name,
  enable: true,
  options,

  setup(node) {
    node.hook('md:afterRender', async ({ content, data, path, renderMarkdown, route }) => {
      if (!isMomentEntry(route.fullPath))
        return

      if (shouldExcludeMoment(data, node.options.mode)) {
        route.delete()
        return
      }

      route.addToMeta({
        momentContent: await renderMarkdown(content, { id: path }),
      })
    })

    node.hook('vue-router:extendRoute', (route) => {
      if (!isMomentsIndex(route.fullPath))
        return

      const frontmatter: Record<string, unknown> = route.meta.frontmatter && typeof route.meta.frontmatter === 'object'
        ? route.meta.frontmatter as Record<string, unknown>
        : {}
      const pageOptions = frontmatter.moments && typeof frontmatter.moments === 'object'
        ? frontmatter.moments as Record<string, unknown>
        : {}

      route.addToMeta({
        ...(!route.meta.layout && node.options.theme === 'yun' ? { layout: 'moments' } : {}),
        frontmatter: {
          toc: false,
          ...(options.title === undefined ? {} : { title: options.title }),
          ...(options.description === undefined ? {} : { description: options.description }),
          ...frontmatter,
          moments: {
            ...(options.author === undefined ? {} : { author: options.author }),
            ...(options.initialCount === undefined ? {} : { initialCount: options.initialCount }),
            ...(options.batchSize === undefined ? {} : { batchSize: options.batchSize }),
            ...pageOptions,
          },
        },
      })
    })
  },
}))
