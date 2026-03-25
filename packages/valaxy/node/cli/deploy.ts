import type { Argv } from 'yargs'
import process from 'node:process'
import { cancel, confirm, intro, isCancel, outro, select } from '@clack/prompts'
import { consola } from 'consola'
import { resolveOptions } from '../options'
import { execBuild } from './build'
import { commonOptions } from './options'

/**
 * valaxy deploy
 * - gh-pages
 * - your own server
 */
export function registerDeployCommand(cli: Argv) {
  cli.command(
    'deploy [root]',
    'deploy your blog to the cloud',
    args => commonOptions(args)
      .option('type', {
        type: 'string',
        choices: ['gh-pages', 'remote'],
        describe: 'deploy type, overrides `deploy.type` in config',
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        default: 'dist',
        describe: 'output dir',
      })
      .strict()
      .help(),
    async ({ root, type, output }) => {
      intro('Deploying Your Blog')

      /**
       * build before deploying
       */
      const shouldBuild = await confirm({
        message: 'Do you want to build your blog before deploying?',
      })
      if (isCancel(shouldBuild)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      if (shouldBuild) {
        await execBuild({ ssg: true, ssgEngine: 'valaxy', root, output, log: 'info' })
      }

      // Lazy resolve options only when needed for config reading
      const options = await resolveOptions({ userRoot: root }, 'build')

      // CLI flag takes priority, then config file
      const configDeployType = type ?? options.config.deploy?.type
      const deployType = configDeployType ?? await select({
        message: 'Where do you want to deploy?',
        options: [
          { label: 'GitHub Pages', value: 'gh-pages' as const, hint: 'You need install `gh-pages` dependencies.' },
          { label: 'Your Own Server', value: 'remote' as const },
        ],
      })
      if (isCancel(deployType)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      if (deployType === 'gh-pages') {
        let isGhPagesInstalled = false
        try {
          await import('gh-pages')
          isGhPagesInstalled = true
        }
        catch {
          const installGhPages = await confirm({
            message: 'Do you want to install `gh-pages` now?',
          })
          if (isCancel(installGhPages)) {
            cancel('Operation cancelled.')
            process.exit(0)
          }

          if (installGhPages) {
            try {
              await import('@antfu/install-pkg')
                .then(i => i.installPackage('gh-pages', { dev: true }))
              isGhPagesInstalled = true
            }
            catch (e) {
              consola.error('Failed to install `gh-pages`:', e)
            }
          }
          else {
            outro('Please install `gh-pages` before deploying to GitHub Pages.')
          }
        }

        if (isGhPagesInstalled) {
          const { publish } = await import('gh-pages')
          await publish(output, {
            branch: 'gh-pages',
            message: 'chore: deploy by valaxy',
          })

          outro('Done!')
        }
      }
      else if (deployType === 'remote') {
        outro('Remote deployment is not yet implemented.')
      }
    },
  )
}
