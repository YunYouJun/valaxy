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

  // Corrected replacements:
  code = code.replaceAll('{%', '\\{\\%')  // Escapes to \{\%
  code = code.replaceAll('%}', '\\%\\}')  // Escapes to \%\}
  return code
}
