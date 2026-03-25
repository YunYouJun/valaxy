import type { HeadConfig, PageData } from '../../../../types'
import type { ResolvedValaxyOptions } from '../../../types'
import path from 'pathe'
import { Valaxy } from '../../../app'
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
 * Matches ![alt](url) and <img src="url"> patterns.
 */
function extractFirstImage(code: string): string | undefined {
  // Match ![...](url)
  const mdImageMatch = code.match(/!\[.*?\]\((.+?)\)/)
  if (mdImageMatch)
    return mdImageMatch[1]

  // Match <img src="url"> or <img src='url'>
  const htmlImageMatch = code.match(/<img\s[^>]*?src=["'](.+?)["']/)
  if (htmlImageMatch)
    return htmlImageMatch[1]

  return undefined
}

export async function generatePageData(code: string, id: string, options: ResolvedValaxyOptions) {
  const fileInfo = Valaxy.state.idMap.get(id)
  const relativePath = path.relative(options.userRoot, id)

  // copy new object
  const fm = JSON.parse(JSON.stringify(fileInfo?.frontmatter))

  // Auto-extract the first image from markdown if ogImage and cover are not set
  if (options.config.features?.extractFirstImage !== false && !fm.ogImage && !fm.cover) {
    const firstImage = extractFirstImage(code)
    if (firstImage)
      fm.firstImage = firstImage
  }

  const pageData: PageData = {
    title: fm.title || fileInfo?.title || '',
    titleTemplate: fm.titleTemplate as any,
    description: inferDescription(fm),
    frontmatter: fm,
    // not be used
    headers: fileInfo?.headers || [],
    relativePath,
    filePath: id,
  }

  if (options.config.siteConfig.lastUpdated)
    pageData.lastUpdated = await getGitTimestamp(id)

  return pageData
}
