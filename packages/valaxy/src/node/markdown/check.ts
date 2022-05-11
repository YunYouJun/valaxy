import chalk from 'chalk'
import consola from 'consola'

/**
 * check Markdown content
 * @param content
 */
export function checkMd(content: string, path: string) {
  if (content.includes('{%') && content.includes('%}')) {
    consola.error(
      `${`${path}\n`}        Please ${chalk.red('remove')} ${chalk.cyan('{% %}')}, because it conflicts with ${chalk.yellow('markdown-it-attrs')}.`,
    )
  }
}
