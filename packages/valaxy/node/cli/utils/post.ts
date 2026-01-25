import { dirname, join, resolve } from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import dayjs from 'dayjs'
import ejs from 'ejs'
import fs from 'fs-extra'
import { defaultPostTemplate, userRoot } from './constants'

import { getTemplate } from './scaffold'

export interface CreatePostParams {
  /**
   * generate date in frontmatter
   */
  date?: boolean
  /**
   * folder
   * @zh-CN 生成文件夹
   */
  folder?: boolean
  path: string
  layout?: string
  title: string
}

export async function create(params: CreatePostParams) {
  const pagesPath = resolve(userRoot, params.path || 'pages')

  let counter = 0
  while (true) {
    const postFileName = `${params.title}${counter ? `-${counter}` : ''}`
    const postFilePath = params.folder ? join(postFileName, 'index.md') : `${postFileName}.md`
    const targetPath = resolve(pagesPath, 'posts', postFilePath)

    if (!await fs.exists(targetPath)) {
      await fs.ensureDir(dirname(targetPath))
      const content = await genLayoutTemplate(params)
      try {
        await fs.writeFile(targetPath, content, 'utf-8')
        consola.success(`[valaxy new]: successfully generated file ${colors.magenta(targetPath)}`)
      }
      catch (e) {
        console.log(e)
        consola.error(`[valaxy new]: failed to write file ${targetPath}`)
        consola.warn(`You should run ${colors.green('valaxy new')} in your valaxy project root directory.`)
      }
      return targetPath
    }
    counter++
  }
}

async function genLayoutTemplate({
  date,
  title,
  layout = 'post',
}: CreatePostParams) {
  let template = await getTemplate(layout)

  if (!template)
    template = defaultPostTemplate

  // 24h format
  const dateFormat = 'YYYY-MM-DD HH:mm:ss'
  return ejs.render(template, { title, layout, date: date ? dayjs().format(dateFormat) : '' })
}
