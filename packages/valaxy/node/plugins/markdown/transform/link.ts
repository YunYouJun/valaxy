/**
 * use AppLink to auto transform a tag to vue-router link
 */
export function transformLink(code: string) {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  return code.replace(/<a (.*?)>(.*?)<\/a>/g, '<AppLink $1>$2</AppLink>')
}
