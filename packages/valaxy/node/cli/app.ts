import type { Argv } from 'yargs'
import { resolve } from 'node:path'
import spawn from 'cross-spawn'

/** Forward a local project to the optional YunZhan CLI without evaluating config. */
export async function openDesktopApp(path = '.', appPath?: string): Promise<void> {
  const args = ['app', resolve(path)]
  if (appPath)
    args.push('--app', resolve(appPath))
  await new Promise<void>((resolve, reject) => {
    const child = spawn('yunzhan', args, { stdio: 'inherit' })
    child.once('error', (error: NodeJS.ErrnoException) => {
      reject(error.code === 'ENOENT'
        ? new Error('YunZhan CLI was not found. Install the YunZhan desktop app and @yunlefun/cms-cli first, then retry. Nothing was downloaded or installed automatically.')
        : error)
    })
    child.once('exit', (code, signal) => {
      if (code === 0)
        resolve()
      else
        reject(new Error(`YunZhan CLI failed (${signal || code}). Run yunzhan doctor to check the desktop installation.`))
    })
  })
}

/** Register a core command so app opening never enters addon/config resolution. */
export function registerAppCommand(cli: Argv): void {
  cli.command(
    'app [path]',
    'Open a local project in the YunZhan desktop app (requires yunzhan CLI)',
    args => args
      .positional('path', { type: 'string', default: '.', describe: 'Local project directory' })
      .option('app', { type: 'string', describe: 'Explicit YunZhan .app, .exe or AppImage path' })
      .strict(),
    async args => openDesktopApp(args.path, args.app),
  )
}
