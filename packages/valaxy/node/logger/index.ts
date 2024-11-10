import consola from 'consola'
import { colors } from 'consola/utils'
import ora from 'ora'
import { magenta } from 'picocolors'
import type { HookKeys } from 'hookable'
import type { ValaxyHooks, ValaxyNode } from '../types'

export const logger = consola.create({})

const prefix = `${magenta('valaxy')}:`
export const vLogger = {
  success: (...args: any) => logger.success(prefix, ...args),
  info: (...args: any) => logger.info(prefix, ...args),
  ready: (...args: any) => logger.ready(prefix, ...args),
}

/**
 * log for hook run
 */
export async function callHookWithLog(hookName: HookKeys<ValaxyHooks>, valaxyApp: ValaxyNode) {
  const hookNameStr = `${colors.cyan('[HOOK]')} ${magenta(hookName)}`
  const s = ora(`${hookNameStr} calling...`).start()
  await valaxyApp.hooks.callHook(hookName)
  s.succeed(`${hookNameStr} done.`)
}
