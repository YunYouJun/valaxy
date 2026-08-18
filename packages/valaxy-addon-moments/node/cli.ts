import type { Dayjs } from 'dayjs'
import type { Argv } from 'yargs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import dayjs from 'dayjs'
import fs from 'fs-extra'
import pkg from '../package.json'

const INVALID_FILENAME_CHARS = '<>:"/\\|?*'

export interface CreateMomentParams {
  now?: Dayjs
  root?: string
  title?: string
}

export type CreateMoment = (params?: CreateMomentParams) => Promise<string>

export interface RegisterMomentsCliOptions {
  create?: CreateMoment
  root: string
}

function genMomentTemplate(now: Dayjs) {
  return `---
date: ${now.format('YYYY-MM-DD HH:mm')}
location:
images:
  - image-url.jpg
---
`
}

function normalizeMomentTitle(title?: string) {
  if (title === undefined)
    return undefined

  const normalized = title.trim()
  if (!normalized)
    throw new Error('The moment title cannot be empty.')
  const hasInvalidCharacter = [...normalized].some((character) => {
    return character.charCodeAt(0) < 32 || INVALID_FILENAME_CHARS.includes(character)
  })
  if (hasInvalidCharacter || normalized.endsWith('.'))
    throw new Error(`The moment title "${title}" contains characters that are unsafe in a file name.`)

  return normalized
}

function resolveMomentFile(momentsPath: string, fileName: string) {
  const targetPath = resolve(momentsPath, fileName)
  const relativePath = relative(momentsPath, targetPath)
  if (
    !relativePath
    || relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
    || isAbsolute(relativePath)
  ) {
    throw new Error(`Refusing to create a moment outside ${momentsPath}.`)
  }

  return targetPath
}

export async function createMoment({
  now = dayjs(),
  root = process.cwd(),
  title,
}: CreateMomentParams = {}) {
  const normalizedTitle = normalizeMomentTitle(title)
  const date = now.format('YYYY-MM-DD')
  const momentsPath = resolve(root, 'pages', 'moments')
  const baseName = normalizedTitle ? `${date}-${normalizedTitle}` : date
  let counter = normalizedTitle ? 0 : 1

  await fs.ensureDir(momentsPath)

  while (true) {
    const suffix = counter ? `-${counter}` : ''
    const targetPath = resolveMomentFile(momentsPath, `${baseName}${suffix}.md`)

    try {
      await fs.writeFile(targetPath, genMomentTemplate(now), { encoding: 'utf-8', flag: 'wx' })
      consola.success(`[valaxy moments new]: successfully generated file ${colors.magenta(targetPath)}`)
      return targetPath
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        counter++
        continue
      }

      consola.error(`[valaxy moments new]: failed to write file ${targetPath}`)
      throw error
    }
  }
}

export function registerMomentsCli(
  cli: Argv<object>,
  { create = createMoment, root }: RegisterMomentsCliOptions,
) {
  cli.version(pkg.version)
  cli.command(
    'new [title]',
    'Draft a new moment',
    args => args
      .usage('$0 moments new [title]')
      .positional('title', {
        describe: 'The optional title of the new moment',
        type: 'string',
      })
      .strict()
      .help(),
    async ({ title }) => {
      await create({ root, title: title as string | undefined })
    },
  )
}
