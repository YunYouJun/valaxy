import { writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import dayjs from 'dayjs'
import { ensureSuffix } from '@antfu/utils'
import { exists } from './fs'

export interface CreatePostParams {
  date?: boolean
  path: string
  layout?: string
  title: string
}

const root = process.cwd()

const pagesPath = resolve(root, 'pages')

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
      const content = genPostTemplate(data)
      writeFile(destinationPath, content, 'utf-8')
      return destinationPath
    }
    counter++
  }
}

function genPostTemplate({
  date,
  title,
  layout = 'post',
}: CreatePostParams) {
  let post = '---\n'

  const content = [`layout: ${layout}`, `title: ${title}`]

  if (date)
    content.push(`date: ${dayjs().format('YYYY-MM-DD hh:mm:ss')}`)

  post += content.join('\n')
  return `${post}
---

`
}

