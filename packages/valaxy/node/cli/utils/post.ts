import { writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { render } from 'ejs'
import dayjs from 'dayjs'
import { ensureSuffix } from '@antfu/utils'
import { exists } from './fs'
import { getTemplate } from './scaffold'
import { defaultPostTemplate, userRoot } from './constants'

export interface CreatePostParams {
  date?: boolean
  path: string
  layout?: string
  title: string
}

const pagesPath = resolve(userRoot, 'pages')

export const create = async (data: CreatePostParams) => {
  const {
    path,
    title,
  } = data
  const postPath = path || join('posts', title)

  let counter = 0

  while (true) {
    let destinationPath = join(pagesPath, postPath)

    if (counter)
      destinationPath = `${destinationPath}-${counter}`

    destinationPath = ensureSuffix('.md', destinationPath)

    if (!await exists(destinationPath)) {
      const content = await genLayoutTemplate(data)
      writeFile(destinationPath, content, 'utf-8')
      return destinationPath
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
  return render(template, { title, layout, date: date ? dayjs().format(dateFormat) : '' })
}
