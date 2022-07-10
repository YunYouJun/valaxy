import path from 'path'
import { readFile } from 'fs/promises'
import { resolveOptions } from '../../options'
import { exists } from './fs'
import { userRoot } from './constants'

export const getTemplate = async (layout: string): Promise<string | false> => {
  const { clientRoot } = await resolveOptions({ userRoot })
  const scaffoldPath = path.resolve(clientRoot, 'scaffolds', `${layout}.md`)

  if (await exists(scaffoldPath))
    return readFile(scaffoldPath, 'utf-8')

  return false
}
