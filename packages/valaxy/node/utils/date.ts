import dayjs from 'dayjs'
import fs from 'fs-extra'
import { getGitTimestamp } from './getGitTimestamp'

/**
 * get created time of file
 * @param file
 * @returns
 */
export async function getCreatedTime(file: string): Promise<Date | number> {
  return (await getGitTimestamp(file, 'created')) || (await fs.stat(file)).ctime
}

/**
 * get created time of file
 * @param file
 * @returns
 */
export async function getUpdatedTime(file: string): Promise<Date | number> {
  return (await getGitTimestamp(file, 'created')) || (await fs.stat(file)).mtime
}

export async function formatMdDate(data: any, path: string, format = 'YYYY-MM-DD HH:mm:ss', lastUpdated = true) {
  if (!data.date)
    data.date = await getCreatedTime(path)

  // format
  data.date = dayjs(data.date).format(format)

  if (lastUpdated) {
    if (!data.updated)
      data.updated = await getUpdatedTime(path)

    data.updated = dayjs(data.updated).format(format)
  }
}
