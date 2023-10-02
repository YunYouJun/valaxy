import { type PathLike } from 'node:fs'
import { access } from 'fs-extra'

export async function exists(path: PathLike) {
  try {
    await access(path)
    return true
  }
  catch (e) {
    return false
  }
}
