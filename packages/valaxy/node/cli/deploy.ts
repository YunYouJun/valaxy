import type { Argv } from 'yargs'
import process from 'node:process'
import { confirm, intro, outro, select } from '@clack/prompts'
import { execBuild } from './build'

/**
 * valaxy deploy
 * - gh-pages
 * - your own server
 * @TODO add config
 */
export function registerDeployCommand(cli: Argv) {
  cli.command('deploy', 'deploy your blog to the cloud', async () => {
    intro('Deploying Your Blog')
    // build

    /**
     * build before deploying
     */
    const shouldBuild = await confirm({
      message: 'Do you want to build your blog before deploying?',
    })

    if (shouldBuild) {
      // build
      await execBuild({ ssg: true, root: process.cwd(), output: 'dist', log: 'info' })
    }

    const deployType = await select({
      message: 'Where do you want to deploy?',
      options: [
        { label: 'GitHub Pages', value: 'gh-pages', hint: 'You need install `gh-pages` dependencies.' },
        { label: 'Your Own Server', value: 'server' },
      ],
    })

    if (deployType === 'gh-pages') {
      // gh-pages
      // check if gh-pages is installed
      let isGhPagesInstalled = false
      try {
        await import('gh-pages')
        isGhPagesInstalled = true
      }
      catch (e) {
        console.error(e)
        const installGhPages = await confirm({
          message: 'Do you want to install `gh-pages` now?',
        })
        if (installGhPages) {
          await import('@antfu/install-pkg')
            .then(i => i.installPackage('gh-pages', { dev: true }))
          isGhPagesInstalled = true
        }
        else {
          outro('Please install `gh-pages` before deploying to GitHub Pages.')
        }
      }

      if (isGhPagesInstalled) {
        const { publish } = await import('gh-pages')
        await publish('dist', {
          branch: 'gh-pages',
          message: 'chore: deploy by valaxy',
        })

        outro('Done!')
      }
    }
  })
}
