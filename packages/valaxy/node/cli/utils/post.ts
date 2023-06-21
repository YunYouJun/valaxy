import { join, resolve } from 'node:path'
import { writeFile } from 'fs-extra'
import { render } from 'ejs'
import dayjs from 'dayjs'
import { ensureSuffix } from '@antfu/utils'
import { consola } from 'consola'
import { green, magenta } from 'kolorist'
import { exists } from './fs'
import { getTemplate } from './scaffold'
import { defaultPostTemplate, userRoot } from './constants'

export interface CreatePostParams {
  date?: boolean
  path: string
  layout?: string
  title: string
}

export async function create(data: CreatePostParams) {
  const pagesPath = resolve(userRoot, 'pages')
  const {
    path,
    title,
  } = data
  const postPath = path || join('posts', title)

  let counter = 0

  while (true) {
    let destinationPath = resolve(pagesPath, postPath)

    if (counter)
      destinationPath = `${destinationPath}-${counter}`

    destinationPath = ensureSuffix('.md', destinationPath)

    if (!await exists(destinationPath)) {
      const content = await genLayoutTemplate(data)
      try {
        writeFile(destinationPath, content, 'utf-8')
        consola.success(`[valaxy new]: successfully generated file ${magenta(destinationPath)}`)
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        consola.error(`[valaxy new]: failed to write file ${destinationPath}`)
        consola.warn(`You should run ${green('valaxy new')} in your valaxy project root directory.`)
      }
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
