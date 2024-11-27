import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import { logger } from '../logger'

export function isProd() {
  return process.env.NODE_ENV === 'production'
}

export function setEnv(env = 'development') {
  process.env.NODE_ENV = env
  consola.level = isProd() ? 2 : 3
  logger.level = consola.level
}

export function setEnvProd() {
  return setEnv('production')
}

/**
 * is pages dir exist
 */
export function isPagesDirExist(root: string) {
  const exist = fs.existsSync(path.resolve(root, 'pages'))
  if (!exist)
    logger.error(`No pages directory found in ${root}`)
  return exist
}
