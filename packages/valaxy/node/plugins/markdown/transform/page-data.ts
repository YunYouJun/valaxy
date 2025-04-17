import type { HeadConfig, PageData } from 'valaxy/types'
import type { ResolvedValaxyOptions } from '../../../options'
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

export async function generatePageData(code: string, id: string, options: ResolvedValaxyOptions) {
  const fileInfo = Valaxy.state.idMap.get(id)
  const relativePath = path.relative(options.userRoot, id)

  // copy new object
  const fm = JSON.parse(JSON.stringify(fileInfo?.frontmatter))

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

  // if (includeLastUpdatedData)
  // TODO: add option
  pageData.lastUpdated = await getGitTimestamp(id)

  return pageData
}
