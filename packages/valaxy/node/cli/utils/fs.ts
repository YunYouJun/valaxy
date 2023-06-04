import { type PathLike } from 'node:fs'
import { access } from 'fs-extra'

export async function exists(path: PathLike) {
  try {
    await access(path)
    return true
  // eslint-disable-next-line @typescript-eslint/brace-style
  } catch (e) {
    return false
  }
}
