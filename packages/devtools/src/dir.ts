import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(fileURLToPath(import.meta.resolve('@valaxyjs/devtools/package.json')))

export const DIR_DIST = resolve(packageRoot, 'dist')
export const DIR_CLIENT = resolve(DIR_DIST, 'client')
