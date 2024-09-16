import path from 'node:path'
import process from 'node:process'
import fs from 'fs-extra'
import type yargs from 'yargs'
import consola from 'consola'
import { exists } from './utils/fs'

export async function cleanDist() {
  const distDir = path.join(process.cwd(), 'dist')
  const cacheDir = path.join(process.cwd(), '.valaxy')

  consola.box('🧹 Starting clean...')

  // Clean the dist directory
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

  // Clean the cache directory
  if (await exists(cacheDir)) {
    consola.info('.valaxy cache directory exists, removing...')
    try {
      await fs.rm(cacheDir, { recursive: true, force: true })
      consola.success('.valaxy cache directory has been successfully removed.')
    }
    catch (error) {
      consola.error('Failed to remove .valaxy cache directory.')
      consola.error(error)
    }
  }
  else {
    consola.info('No .valaxy cache directory found, nothing to clean.')
  }
}

export function registerCleanCommand(cli: yargs.Argv) {
  cli.command(
    'clean',
    'Clean the dist folder and cache',
    () => { },
    async () => {
      await cleanDist()
    },
  )
}
