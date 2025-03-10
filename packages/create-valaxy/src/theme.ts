/* eslint-disable no-console */
import { colors } from 'consola/utils'
import { execa } from 'execa'
import prompts from 'prompts'

const starterTheme = {
  name: 'starter',
  display: `Starter`,
  repo: 'https://github.com/valaxyjs/valaxy-theme-starter',
}

export async function initTheme(options: {
  themeName?: string
}) {
  const defaultThemeName = starterTheme.name
  let themeName = options.themeName || defaultThemeName
  if (!themeName) {
    /**
     * @type {{ theme: string }}
     */
    const { theme } = await prompts({
      type: 'text',
      name: 'theme',
      message: 'Theme name: valaxy-theme-',
      initial: defaultThemeName,
    })
    themeName = theme || defaultThemeName
  }

  const targetDir = `valaxy-theme-${themeName!.trim()}`

  console.log(`  ${colors.dim('npx')} ${colors.gray('degit')} ${colors.blue(starterTheme.repo)} ${colors.yellow(targetDir)}`)
  await execa('npx', ['degit', starterTheme.repo, targetDir], { stdio: 'inherit' })

  console.log()
  console.log(`  ${colors.bold('Check it')}:`)
  console.log()
  console.log(`- Change ${colors.bold('author')} name in ${colors.yellow('LICENSE')} & ${colors.green('package.json')} & ${colors.blue('.github')}`)
  console.log(`- Change ${colors.blue('valaxy.config.ts')} theme: ${colors.yellow('starter')} to ${colors.cyan(`${themeName}`)}`)
  console.log(`- Rename ${colors.yellow(`valaxy-theme-${themeName}`)} to ${colors.cyan(`valaxy-theme-${themeName}`)}`)
  console.log()
  console.log(`  ${colors.cyan('✨')}`)
  console.log()

  return `valaxy-theme-${themeName}`
}
