import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DIR_DIST = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

const DEVTOOLS_CLIENT_FOLDER = resolve(DIR_DIST, '../dist/client')

export const DIR_CLIENT = DEVTOOLS_CLIENT_FOLDER
