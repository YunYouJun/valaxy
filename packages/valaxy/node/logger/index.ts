import type { HookKeys } from 'hookable'
import type { ValaxyHooks, ValaxyNode } from '../types'
import consola from 'consola'
import { colors } from 'consola/utils'
import ora from 'ora'

export const logger = consola.create({})

export const valaxyPrefix = colors.magenta('[valaxy]')
export const vLogger = {
  success: (...args: any) => logger.success(valaxyPrefix, ...args),
  info: (...args: any) => logger.info(valaxyPrefix, ...args),
  ready: (...args: any) => logger.ready(valaxyPrefix, ...args),
}

/**
 * log for hook run
 */
export async function callHookWithLog(hookName: HookKeys<ValaxyHooks>, valaxyApp: ValaxyNode) {
  const hookNameStr = `${colors.cyan('[HOOK]')} ${colors.magenta(hookName)}`
  const s = ora(`${hookNameStr} calling...`).start()
  await valaxyApp.hooks.callHook(hookName)
  s.succeed(`${hookNameStr} done.`)
}
