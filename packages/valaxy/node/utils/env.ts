import { logger } from '../logger'

export const isProd = () => process.env.NODE_ENV === 'production'

export const setEnv = (env = 'development') => {
  process.env.NODE_ENV = env
  logger.level = isProd() ? 2 : 3
}

export const setEnvProd = () => setEnv('production')
