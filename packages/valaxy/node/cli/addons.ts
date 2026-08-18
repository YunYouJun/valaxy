import type { Argv } from 'yargs'
import type { ValaxyAddonExtendCli, ValaxyAddons } from '../types'
import { isAbsolute } from 'node:path'
import { resolveValaxyConfig } from '../config'

const ADDON_PACKAGE_PREFIX = 'valaxy-addon-'
const ADDON_COMMAND_RE = /^[a-z0-9][a-z0-9-]*$/

/** Root commands that addons may not shadow. */
export const CORE_CLI_COMMANDS = new Set([
  'addon',
  'build',
  'clean',
  'completion',
  'debug',
  'deploy',
  'dev',
  'fuse',
  'help',
  'llms',
  'new',
  'rss',
  'version',
])

export interface ResolvedAddonCliExtension {
  addonName: string
  commandName: string
  extendCli: ValaxyAddonExtendCli
}

function configuredAddonValues(addons: ValaxyAddons = []) {
  return Array.isArray(addons) ? addons : Object.values(addons)
}

export function getAddonCommandName(addonName: string) {
  const packageName = addonName.includes('/')
    ? addonName.slice(addonName.lastIndexOf('/') + 1)
    : addonName

  if (!packageName.startsWith(ADDON_PACKAGE_PREFIX)) {
    throw new Error(
      `Addon "${addonName}" cannot extend the CLI because its package name does not start with "${ADDON_PACKAGE_PREFIX}".`,
    )
  }

  const commandName = packageName.slice(ADDON_PACKAGE_PREFIX.length)
  if (!ADDON_COMMAND_RE.test(commandName))
    throw new Error(`Addon "${addonName}" resolves to an invalid CLI command name "${commandName}".`)

  return commandName
}

export function collectAddonCliExtensions(addons: ValaxyAddons = []) {
  const extensions: ResolvedAddonCliExtension[] = []
  const owners = new Map<string, string>()

  for (const addon of configuredAddonValues(addons)) {
    if (!addon || typeof addon === 'string' || addon.enable === false || typeof addon.extendCli !== 'function')
      continue

    const commandName = getAddonCommandName(addon.name)
    if (CORE_CLI_COMMANDS.has(commandName)) {
      throw new Error(
        `Addon "${addon.name}" cannot register the reserved Valaxy command "${commandName}".`,
      )
    }

    const owner = owners.get(commandName)
    if (owner) {
      throw new Error(
        `Addons "${owner}" and "${addon.name}" both register the Valaxy command "${commandName}".`,
      )
    }

    owners.set(commandName, addon.name)
    extensions.push({
      addonName: addon.name,
      commandName,
      extendCli: addon.extendCli,
    })
  }

  return extensions
}

export async function resolveAddonCliExtensions(userRoot: string) {
  const { config } = await resolveValaxyConfig({ userRoot })
  return collectAddonCliExtensions(config?.addons)
}

export function registerAddonCliExtensions(
  cli: Argv<object>,
  extensions: ResolvedAddonCliExtension[],
  userRoot: string,
) {
  for (const extension of extensions) {
    let scopedCli: Argv<object> | undefined

    cli.command(
      extension.commandName,
      `Commands provided by ${extension.addonName}`,
      (args: Argv<object>) => {
        const scope = args
          .usage(`$0 ${extension.commandName} <command>`)
          .strict()
          .help()
        scopedCli = scope
        extension.extendCli(scope, { userRoot })
        return scope
      },
      () => {
        scopedCli?.showHelp('log')
      },
    )
  }
}

export function getRequestedCommand(argv: string[]) {
  const command = argv[0]
  return command && !command.startsWith('-') ? command : undefined
}

export function shouldResolveAddonCli(argv: string[]) {
  const command = getRequestedCommand(argv)
  if (!command || CORE_CLI_COMMANDS.has(command))
    return false

  // An explicit path always selects the default dev command.
  return command !== '.'
    && !command.startsWith('./')
    && !command.startsWith('../')
    && !isAbsolute(command)
}
