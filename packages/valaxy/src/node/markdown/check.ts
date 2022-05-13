import { cyan, red, yellow } from 'kolorist'
import consola from 'consola'

/**
 * check Markdown content
 * @param content
 */
export function checkMd(content: string, path: string) {
  if (content.includes('{%') && content.includes('%}')) {
    consola.error(
      `${`${path}\n`}        Please ${red('remove')} ${cyan('{% %}')}, because it conflicts with ${yellow('markdown-it-attrs')}.`,
    )
  }
}
