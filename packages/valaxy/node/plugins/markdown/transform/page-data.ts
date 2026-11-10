import type { Header } from '@valaxyjs/utils'
import type { HeadConfig, PageData } from '../../../../types'
import type { ResolvedValaxyOptions } from '../../../types'
import type { MarkdownTransformContext } from '../types'
import { existsSync } from 'node:fs'
import path from 'pathe'
import { extractMarkdownImage, pickShareImage, stripEncryptedContent } from '../../../../shared/seo'
import { getGitTimestamp } from '../../../utils'

function getHeadMetaContent(head: HeadConfig[], name: string): string | undefined {
  if (!head || !head.length)
    return undefined

  const meta = head.find(([tag, attrs = {}]) => {
    return tag === 'meta' && attrs.name === name && attrs.content
  })

  return meta && meta[1].content
}

function inferDescription(frontmatter: Record<string, any>) {
  const { description, head } = frontmatter

  if (description !== undefined)
    return description

  return (head && getHeadMetaContent(head, 'description')) || ''
}

/**
 * Extract the first image URL from markdown content.
 * Matches ![alt](url) and <img src="url">, skipping fenced code and markdown titles.
 */
function extractFirstImage(code: string): string | undefined {
  return extractMarkdownImage(code)
}

function filterPublicHeaders(headers: Header[], publicHeadingIds: Set<string>): Header[] {
  return headers.flatMap((header) => {
    const children = header.children ? filterPublicHeaders(header.children, publicHeadingIds) : []
    // Public headings can follow an encrypted parent without closing its outline
    // level. Promote those children instead of discarding the entire subtree.
    if (!publicHeadingIds.has(header.slug))
      return children
    return [{ ...header, ...(header.children ? { children } : {}) }]
  })
}

export async function generatePageData(code: string, context: MarkdownTransformContext, options: ResolvedValaxyOptions) {
  const { id, fileInfo } = context
  const relativePath = path.relative(options.userRoot, id)

  // copy new object
  const fm = fileInfo?.frontmatter
    ? JSON.parse(JSON.stringify(fileInfo.frontmatter))
    : {}

  // Auto-extract the first image from markdown if ogImage and cover are not set
  if (options.config.features?.extractFirstImage !== false && !fm.password && fm.encrypt !== true && !fm.ogImage && !fm.cover) {
    const firstImage = extractFirstImage(code)
    if (firstImage)
      fm.firstImage = firstImage
  }

  // Header/title extraction precedes encryption. Never serialize private headings.
  const isPrivate = !!fm.password || fm.encrypt === true
  const publicCode = stripEncryptedContent(code)
  const hasPrivateContent = isPrivate || publicCode !== code
  const publicHeadingIds = new Set(Array.from(publicCode.matchAll(/<h[1-6]\s[^>]*\bid=["']([^"']+)["'][^>]*>/g), match => match[1]))
  const publicHeaders = filterPublicHeaders(fileInfo?.headers || [], publicHeadingIds)
  const firstHeading = code.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0]
  const hasPublicTitle = !isPrivate && (!hasPrivateContent || (firstHeading && publicCode.includes(firstHeading)))
  const pageData: PageData = {
    title: fm.title || (hasPublicTitle && fileInfo?.title) || '',
    titleTemplate: fm.titleTemplate as any,
    description: inferDescription(fm),
    frontmatter: fm,
    // not be used
    headers: isPrivate ? [] : hasPrivateContent ? publicHeaders : fileInfo?.headers || [],
    relativePath,
    filePath: id,
  }

  if (options.config.siteConfig.lastUpdated && fm.lastUpdated !== false)
    pageData.lastUpdated = await getGitTimestamp(id)

  return pageData
}

/** Resolve source-relative images through Vite, not the canonical route directory. */
export function resolvePageImageImports(frontmatter: Record<string, any>, id: string) {
  const imports: string[] = []
  const assignments: string[] = []
  for (const key of ['ogImage', 'cover', 'firstImage']) {
    const src = pickShareImage([frontmatter[key]])
    if (!src || src.startsWith('/') || /^[a-z][\w+.-]*:/i.test(src))
      continue

    const [urlPath] = src.split(/[?#]/)
    const suffix = src.slice(urlPath.length)
    let filename = urlPath
    try {
      filename = decodeURI(urlPath)
    }
    catch {}
    // Preserve legacy public URLs when no source asset exists beside the page.
    if (!existsSync(path.resolve(path.dirname(id), filename)))
      continue

    const name = `__valaxy_${key}`
    const request = `${filename.startsWith('.') ? filename : `./${filename}`}?url&no-inline`
    // Social crawlers need a fetchable asset, including when Vite would inline it.
    imports.push(`import ${name} from ${JSON.stringify(request)}`)
    assignments.push(`pageData.value.frontmatter.${key} = ${name} + ${JSON.stringify(suffix)}`)
  }
  return { imports, assignments }
}
