import type { HeadConfig, PageData } from 'valaxy/types'
import path from 'pathe'
import { getGitTimestamp } from '../../../utils'
import type { ResolvedValaxyOptions } from '../../../options'

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

export async function generatePageData(code: string, id: string, options: ResolvedValaxyOptions) {
  const { frontmatter = {} as Record<string, any> } = options.env
  const relativePath = path.relative(options.userRoot, id)

  const pageData: PageData = {
    title: frontmatter.title || options.env.title || '',
    titleTemplate: frontmatter.titleTemplate as any,
    description: inferDescription(frontmatter),
    frontmatter,
    // not be used
    headers: options.env.headers || [],
    relativePath,
    path: id,
  }

  // if (includeLastUpdatedData)
  // TODO: add option
  pageData.lastUpdated = await getGitTimestamp(id)

  return pageData
}
