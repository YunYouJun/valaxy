import consola from 'consola'
import { cyan, red, yellow } from 'picocolors'

/**
 * replace hexo tag, conflict with markdown-it-attrs
 */
export function transformHexoTags(code: string, id: string) {
  if (code.includes('{%') && code.includes('%}')) {
    consola.error(
      `${`${id}\n`}        Please ${red('remove')} ${cyan('{% %}')}, because it conflicts with ${yellow('markdown-it-attrs')}.`,
    )
  }

  code.replace('{%', '\{\%')
  code.replace('%}', '\%\}')
  return code
}
