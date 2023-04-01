import { logger } from '../logger'

export function isProd() {
  return process.env.NODE_ENV === 'production'
}

export function setEnv(env = 'development') {
  process.env.NODE_ENV = env
  logger.level = isProd() ? 2 : 3
}

export function setEnvProd() {
  return setEnv('production')
}
