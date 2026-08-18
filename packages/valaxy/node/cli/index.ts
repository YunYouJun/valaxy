import type { Argv } from 'yargs'
import type { ValaxyModule } from '../modules'
import { resolve } from 'node:path'
import process from 'node:process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

// type:json
import { version } from '../env'
import { fuseModule } from '../modules/fuse'
import { llmsModule } from '../modules/llms'
import { rssModule } from '../modules/rss'

import { registerAddonCliExtensions, resolveAddonCliExtensions, shouldResolveAddonCli } from './addons'
import { registerBuildCommand } from './build'
import { registerCleanCommand } from './clean'
import { registerDebugCommand } from './debug'
import { registerDeployCommand } from './deploy'
import { registerDevCommand } from './dev'
// commands
import { registerNewCommand } from './new'

export * from './dev'

const modules: ValaxyModule[] = [
  fuseModule,
  llmsModule,
  rssModule,
]

export interface CreateCliOptions {
  userRoot?: string
}

function createCoreCli(argv: string[]) {
  const cli: Argv<object> = yargs(argv)
    .scriptName('valaxy')
    .usage('$0 [args]')
    .version(version)
    .showHelpOnFail(false)
    .alias('h', 'help')
    .alias('v', 'version')

  registerDevCommand(cli)
  registerBuildCommand(cli)
  registerNewCommand(cli)
  registerCleanCommand(cli)
  registerDeployCommand(cli)
  registerDebugCommand(cli)

  modules.forEach((module) => {
    module.extendCli?.(cli)
  })

  return cli.help()
}

export async function createCli(
  argv: string[] = hideBin(process.argv),
  options: CreateCliOptions = {},
) {
  const cli = createCoreCli(argv)
  if (!shouldResolveAddonCli(argv))
    return cli

  const userRoot = resolve(options.userRoot || process.cwd())
  const extensions = await resolveAddonCliExtensions(userRoot)
  registerAddonCliExtensions(cli, extensions, userRoot)
  return cli
}

export async function run(argv: string[] = hideBin(process.argv), options: CreateCliOptions = {}) {
  const cli = await createCli(argv, options)
  await cli.parseAsync()
}
