import { access } from 'fs/promises'
import { type PathLike } from 'fs'

export async function exists(path: PathLike) {
  try {
    await access(path)
    return true
  // eslint-disable-next-line @typescript-eslint/brace-style
  } catch (e) {
    return false
  }
}
