import fs from 'fs-extra'
import { getGitTimestamp } from './getGitTimestamp'

/**
 * get created time of file
 * @param file
 */
export async function getCreatedTime(file: string): Promise<Date | number> {
  return (await getGitTimestamp(file, 'created')) || (await fs.stat(file)).ctime
}

/**
 * get created time of file
 * @param file
 */
export async function getUpdatedTime(file: string): Promise<Date | number> {
  return (await getGitTimestamp(file, 'created')) || (await fs.stat(file)).mtime
}
