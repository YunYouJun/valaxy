import type { Argv } from 'yargs'
import { consola } from 'consola'

/**
 * @TODO valaxy debug
 */
export function registerDebugCommand(cli: Argv) {
  cli.command('debug', 'Debug your blog', async () => {
    consola.info('提问前请携带以下信息：')
  })
}
