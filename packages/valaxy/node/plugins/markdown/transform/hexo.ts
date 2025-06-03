import { consola } from 'consola'
import { colors } from 'consola/utils'

/**
 * replace hexo tag, conflict with markdown-it-attrs
 */
export function transformHexoTags(code: string, id: string) {
  if (code.includes('{%') && code.includes('%}')) {
    consola.error(
      `${`${id}\n`}        Please ${colors.red('remove')} ${colors.cyan('{% %}')}, because it conflicts with ${colors.yellow('markdown-it-attrs')}.`,
    )
  }

  code = code.replaceAll('{%', '\\{\\%')
  code = code.replaceAll('%}', '\\%\\}')
  return code
}
