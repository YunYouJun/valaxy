import consola from 'consola'
import type { Argv } from 'yargs'

/**
 * @TODO valaxy debug
 */
export function registerDebugCommand(cli: Argv) {
  cli.command('debug', 'Debug your blog', async () => {
    consola.info('提问前请携带以下信息：')
  })
}
