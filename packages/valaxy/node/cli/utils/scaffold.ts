import path from 'path'
import { readFile } from 'fs/promises'
import { resolveOptions } from '../../options'
import { exists } from './fs'
import { userRoot } from './constants'

export const getTemplate = async (layout: string): Promise<string | false> => {
  const { clientRoot, themeRoot } = await resolveOptions({ userRoot })
  const roots = [userRoot, themeRoot, clientRoot]

  for (const root of roots) {
    const scaffoldPath = path.resolve(root, 'scaffolds', `${layout}.md`)
    if (await exists(scaffoldPath))
      return readFile(scaffoldPath, 'utf-8')
  }

  return false
}
