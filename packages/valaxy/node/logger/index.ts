import consola from 'consola'
import { magenta } from 'picocolors'

export const logger = consola.create({})

const prefix = `${magenta('valaxy')}:`
export const vLogger = {
  success: (...args: any) => logger.success(prefix, ...args),
  info: (...args: any) => logger.info(prefix, ...args),
  ready: (...args: any) => logger.ready(prefix, ...args),
}
