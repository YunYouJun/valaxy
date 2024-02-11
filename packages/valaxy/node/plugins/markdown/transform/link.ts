/**
 * use AppLink to auto transform a tag to vue-router link
 */
export function transformLink(code: string) {
  return code.replace(/<a (.*?)>(.*?)<\/a>/g, '<AppLink $1>$2</AppLink>')
}
