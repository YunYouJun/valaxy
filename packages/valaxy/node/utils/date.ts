import fs from 'fs-extra'
import { getGitTimestamp } from './getGitTimestamp'

/**
 * stat file, return undefined if it no longer exists
 * (e.g. a page deleted right after being edited in dev)
 * @param file
 */
async function statIfExists(file: string) {
  try {
    return await fs.stat(file)
  }
  catch (e) {
    const code = (e as NodeJS.ErrnoException).code
    if (code === 'ENOENT' || code === 'ENOTDIR')
      return undefined
    throw e
  }
}

/**
 * get created time of file
 * @param file
 */
export async function getCreatedTime(file: string): Promise<Date | number> {
  return (await getGitTimestamp(file, 'created')) || (await statIfExists(file))?.ctime || Date.now()
}

/**
 * get updated time of file
 * @param file
 */
export async function getUpdatedTime(file: string): Promise<Date | number> {
  return (await getGitTimestamp(file, 'updated')) || (await statIfExists(file))?.mtime || Date.now()
}
