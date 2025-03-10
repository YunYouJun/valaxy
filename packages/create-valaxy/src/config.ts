import { colors } from 'consola/utils'
import { initTheme } from './theme'

export const renameFiles: Record<string, string> = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
}

export const TEMPLATES = [
  {
    name: 'blog',
    display: `Blog`,
    desc: 'For Most Users',
    message: 'Project name:',
    initial: 'valaxy-blog',
    color: colors.cyan,
  },
  {
    name: 'theme',
    display: `Theme`,
    desc: 'For Theme Developers',
    message: 'Theme name: valaxy-theme-',
    initial: 'starter',
    prefix: 'valaxy-theme-',
    color: colors.green,
    customInit: async (options: {
      themeName?: string
    }) => {
      return initTheme(options).catch((e) => {
        console.error(e)
      })
    },
  },
  {
    name: 'addon',
    display: `Addon`,
    desc: 'For Addon Developers',
    message: 'Addon name: valaxy-addon-',
    initial: 'template',
    prefix: 'valaxy-addon-',
    color: colors.yellow,
  },
]

export const TEMPLATE_CHOICES = TEMPLATES.map(template => template.name)
