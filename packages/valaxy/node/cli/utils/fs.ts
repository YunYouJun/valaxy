import type { PathLike } from 'node:fs'
import { access } from 'node:fs/promises'

export async function exists(path: PathLike) {
  try {
    await access(path)
    return true
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    return false
  }
}
