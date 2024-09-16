import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import type yargs from 'yargs'
import consola from 'consola'
import { exists } from './utils/fs'

export async function cleanDist() {
  const distDir = path.join(process.cwd(), 'dist')

  consola.box('🧹 Starting clean...')

  if (await exists(distDir)) {
    consola.info('dist directory exists, removing...')

    try {
      await fs.rm(distDir, { recursive: true, force: true })
      consola.success('dist directory has been successfully removed.')
    }
    catch (error) {
      consola.error('Failed to remove dist directory.')
      consola.error(error)
    }
  }
  else {
    consola.info('No dist directory found, nothing to clean.')
  }
}

export function registerCleanCommand(cli: yargs.Argv) {
  cli.command(
    'clean',
    'Clean the dist folder',
    () => { },
    async () => {
      await cleanDist()
    },
  )
}
