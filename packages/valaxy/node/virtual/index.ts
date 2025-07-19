import { templateAddons } from './addons'
import { templateBlogs } from './blogs'
import { templateConfig } from './config'
import { templateLocales } from './locales'
import { templateStyles } from './styles'

export const templates = [
  templateAddons,
  templateConfig,
  templateLocales,
  templateStyles,

  ...templateBlogs,
]
