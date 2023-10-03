/* eslint-disable no-console */
import prompts from 'prompts'
import { execa } from 'execa'
import { blue, bold, cyan, dim, gray, green, yellow } from 'kolorist'

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

  console.log(`  ${dim('npx')} ${gray('degit')} ${blue(starterTheme.repo)} ${yellow(targetDir)}`)
  await execa('npx', ['degit', starterTheme.repo, targetDir], { stdio: 'inherit' })

  console.log()
  console.log(`  ${bold('Check it')}:`)
  console.log()
  console.log(`- Change ${bold('author')} name in ${yellow('LICENSE')} & ${green('package.json')} & ${blue('.github')}`)
  console.log(`- Change ${blue('valaxy.config.ts')} theme: ${yellow('starter')} to ${cyan(`${themeName}`)}`)
  console.log(`- Rename ${yellow(`valaxy-theme-${themeName}`)} to ${cyan(`valaxy-theme-${themeName}`)}`)
  console.log()
  console.log(`  ${cyan('✨')}`)
  console.log()

  return `valaxy-theme-${themeName}`
}
