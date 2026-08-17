import type { MomentsOptions } from '../types'
import { createHash } from 'node:crypto'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

type RenderMarkdown = (source: string, env?: Record<string, unknown>) => Promise<string>

export interface RenderMomentMarkdownOptions {
  content: string
  path: string
  renderMarkdown: RenderMarkdown
  routePath: string
}

const FOOTNOTE_COMPONENT_TAG_RE = /<\/?ValaxyFootnote(?:Anchor|Content|Item|Ref)\b[^>]*>/g
const HTML_ID_RE = /(\sid\s*=\s*)(["'])([^"']+)\2/gi
const HTML_FRAGMENT_HREF_RE = /(\s(?:href|xlink:href)\s*=\s*)(["'])#([^"']+)\2/gi
const HTML_IDREF_RE = /(\s(?:aria-activedescendant|aria-controls|aria-describedby|aria-details|aria-errormessage|aria-flowto|aria-labelledby|aria-owns|for|form|headers|list)\s*=\s*)(["'])([^"']+)\2/gi

function createMomentNamespace(routePath: string) {
  const digest = createHash('sha256').update(routePath).digest('hex').slice(0, 12)
  return `valaxy-moment-${digest}`
}

function namespaceMomentId(value: string, namespace: string) {
  if (
    value === namespace
    || value.startsWith(`${namespace}-`)
    || value.startsWith(`fn-${namespace}-`)
    || value.startsWith(`fnref-${namespace}-`)
  ) {
    return value
  }

  return `${namespace}-${value}`
}

function namespaceMomentHtml(html: string, namespace: string) {
  const plainHtml = html.replace(FOOTNOTE_COMPONENT_TAG_RE, '')
  const contentIds = new Set(
    [...plainHtml.matchAll(HTML_ID_RE)].map(match => match[3]),
  )
  const namespaceReference = (value: string) => {
    return contentIds.has(value) ? namespaceMomentId(value, namespace) : value
  }

  return plainHtml
    .replace(HTML_ID_RE, (_match, attribute, quote, value: string) => {
      return `${attribute}${quote}${namespaceMomentId(value, namespace)}${quote}`
    })
    .replace(HTML_FRAGMENT_HREF_RE, (_match, attribute, quote, value: string) => {
      return `${attribute}${quote}#${namespaceReference(value)}${quote}`
    })
    .replace(HTML_IDREF_RE, (_match, attribute, quote, value: string) => {
      const references = value
        .split(/\s+/)
        .map(namespaceReference)
        .join(' ')
      return `${attribute}${quote}${references}${quote}`
    })
}

export async function renderMomentMarkdown(options: RenderMomentMarkdownOptions) {
  const namespace = createMomentNamespace(options.routePath)
  const html = await options.renderMarkdown(options.content, {
    docId: namespace,
    id: options.path,
  })
  return namespaceMomentHtml(html, namespace)
}

function isMomentsIndex(path: string) {
  return path === '/moments' || path === '/moments/'
}

function isMomentEntry(path: string) {
  return path.startsWith('/moments/') && !isMomentsIndex(path)
}

export function shouldExcludeMoment(data: Readonly<Record<string, unknown>>, mode: 'build' | 'dev') {
  return mode === 'build' && Boolean(data.draft)
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
        momentContent: await renderMomentMarkdown({
          content,
          path,
          renderMarkdown,
          routePath: route.fullPath,
        }),
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
            ...(options.likes === undefined ? {} : { likes: options.likes }),
            ...pageOptions,
          },
        },
      })
    })
  },
}))
