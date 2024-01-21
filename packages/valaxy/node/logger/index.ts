import consola from 'consola'
import { magenta } from 'picocolors'
import { isProd } from '../utils/env'

export const logger = consola.create({
  level: isProd() ? 2 : 3,
})

const prefix = `${magenta('valaxy')}:`
export const vLogger = {
  success: (args: any) => logger.success(prefix, args),
  info: (args: any) => logger.info(prefix, args),
  ready: (args: any) => logger.ready(prefix, args),
}
