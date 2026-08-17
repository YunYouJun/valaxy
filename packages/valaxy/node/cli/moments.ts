import type { Dayjs } from 'dayjs'
import type { Argv } from 'yargs'
import { dirname, resolve } from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import dayjs from 'dayjs'
import fs from 'fs-extra'
import { userRoot } from './utils/constants'

export interface CreateMomentParams {
  now?: Dayjs
  root?: string
  title?: string
}

type CreateMoment = (params?: CreateMomentParams) => Promise<string>

function genMomentTemplate(now: Dayjs) {
  return `---
date: ${now.format('YYYY-MM-DD HH:mm')}
location:
images:
  - 图片地址.jpg
---
`
}

export async function createMoment({
  now = dayjs(),
  root = userRoot,
  title,
}: CreateMomentParams = {}) {
  const date = now.format('YYYY-MM-DD')
  const momentsPath = resolve(root, 'pages', 'moments')
  const baseName = title ? `${date}-${title}` : date
  let counter = title ? 0 : 1

  while (true) {
    const suffix = counter ? `-${counter}` : ''
    const targetPath = resolve(momentsPath, `${baseName}${suffix}.md`)

    try {
      await fs.ensureDir(dirname(targetPath))
      await fs.writeFile(targetPath, genMomentTemplate(now), { encoding: 'utf-8', flag: 'wx' })
      consola.success(`[valaxy moments]: successfully generated file ${colors.magenta(targetPath)}`)
      return targetPath
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        counter++
        continue
      }

      consola.error(`[valaxy moments]: failed to write file ${targetPath}`)
      throw error
    }
  }
}

/**
 * Register the command for creating a moment.
 * @param cli
 * @param create Used by tests to observe command dispatch without writing files.
 */
export function registerMomentsCommand(cli: Argv<object>, create: CreateMoment = createMoment) {
  cli.command(
    'moments [title]',
    'Draft a new moment',
    args => args
      .usage('$0 moments [title]')
      .positional('title', {
        describe: 'The optional title of the new moment',
        type: 'string',
      })
      .strict()
      .help(),
    async ({ title }) => {
      await create({ title: title as string | undefined })
    },
  )
}
