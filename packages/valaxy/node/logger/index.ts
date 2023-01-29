import consola from 'consola'
import { isProd } from '../utils/env'

export const logger = consola.create({
  level: isProd() ? 2 : 3,
})
