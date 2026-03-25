import type { Argv } from 'yargs'
import { execSync } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import { version } from '../env'
import { resolveOptions } from '../options'

interface DebugInfo {
  os: string
  arch: string
  node: string
  pnpm: string
  valaxy: string
  userRoot?: string
  theme?: string
  themeVersion?: string
  addons?: { name: string, version: string, global: boolean }[]
  pages?: number
}

function getPnpmVersion(): string {
  try {
    return execSync('pnpm --version', { encoding: 'utf-8' }).trim()
  }
  catch {
    return 'not found'
  }
}

async function collectDebugInfo(): Promise<DebugInfo> {
  const info: DebugInfo = {
    os: os.platform(),
    arch: os.arch(),
    node: process.version,
    pnpm: getPnpmVersion(),
    valaxy: version,
  }

  try {
    const options = await resolveOptions({ userRoot: process.cwd() })
    info.userRoot = options.userRoot
    info.theme = options.theme
    info.themeVersion = options.config.themeConfig?.pkg?.version
    info.addons = options.addons
      .filter(a => a.enable)
      .map(a => ({
        name: a.name,
        version: a.pkg?.version || 'unknown',
        global: a.global,
      }))
    info.pages = options.pages.length
  }
  catch {
    // Not in a Valaxy project, skip project info
  }

  return info
}

function printFancy(info: DebugInfo) {
  const lines: string[] = []

  lines.push(`${colors.bold(colors.cyan('Environment'))}`)
  lines.push(`  OS:              ${colors.green(`${info.os} ${info.arch}`)}`)
  lines.push(`  Node.js:         ${colors.green(info.node)}`)
  lines.push(`  Package Manager: ${colors.green(`pnpm ${info.pnpm}`)}`)
  lines.push(`  Valaxy:          ${colors.cyan(`v${info.valaxy}`)}`)

  if (info.theme) {
    lines.push('')
    lines.push(`${colors.bold(colors.cyan('Project'))}`)
    lines.push(`  Root:   ${colors.dim(info.userRoot!)}`)
    lines.push(`  Theme:  ${colors.green(info.theme)} ${colors.blue(`v${info.themeVersion || 'unknown'}`)}`)

    if (info.addons && info.addons.length > 0) {
      lines.push(`  Addons:`)
      info.addons.forEach((addon, i) => {
        const prefix = i === info.addons!.length - 1 ? '└─' : '├─'
        const globalTag = addon.global ? colors.cyan(' (global)') : ''
        lines.push(`    ${prefix} ${colors.yellow(addon.name)} ${colors.blue(`v${addon.version}`)}${globalTag}`)
      })
    }
    else {
      lines.push(`  Addons:  ${colors.dim('none')}`)
    }

    lines.push(`  Pages:  ${colors.green(String(info.pages))}`)
  }

  consola.box({
    title: '🌌 Valaxy Debug Info',
    message: lines.join('\n'),
    style: {
      borderColor: 'cyan',
    },
  })
}

function printPlain(info: DebugInfo) {
  const lines: string[] = []

  lines.push('## Environment')
  lines.push(`- OS: ${info.os} ${info.arch}`)
  lines.push(`- Node: ${info.node}`)
  lines.push(`- Package Manager: pnpm ${info.pnpm}`)
  lines.push(`- Valaxy: v${info.valaxy}`)

  if (info.theme) {
    lines.push('')
    lines.push('## Project')
    lines.push(`- Root: ${info.userRoot}`)
    lines.push(`- Theme: ${info.theme} (v${info.themeVersion || 'unknown'})`)

    if (info.addons && info.addons.length > 0) {
      const addonStr = info.addons
        .map(a => `${a.name} (v${a.version})${a.global ? ' [global]' : ''}`)
        .join(', ')
      lines.push(`- Addons: ${addonStr}`)
    }
    else {
      lines.push('- Addons: none')
    }

    lines.push(`- Pages: ${info.pages}`)
  }

  // Use console.log for plain text (no colors, easy to copy)
  console.log(lines.join('\n'))
}

export function registerDebugCommand(cli: Argv) {
  cli.command(
    'debug',
    'Display debug information for your Valaxy project',
    args => args.option('plain', {
      type: 'boolean',
      default: false,
      describe: 'Output plain text without colors (for pasting into issues)',
    }),
    async (args) => {
      const info = await collectDebugInfo()
      if (args.plain)
        printPlain(info)
      else
        printFancy(info)
    },
  )
}
