import * as base64 from 'js-base64'

/**
 * Transform Mermaid code blocks (render done on client side)
 */
export function transformMermaid(md: string): string {
  // replace ```mermaid with ```txt\n```mermaid, avoid parsing by mermaid
  md = md.replace(/^````txt\n```mermaid/gm, '````txt\n\\`\\`\\`mermaid')

  md = md
    .replace(/^```mermaid\s*?(\{.*?\})?\n([\s\S]+?)\n```/gm, (full, options = '', code = '') => {
      code = code.trim()
      options = options.trim() || '{}'
      const encoded = base64.encode(code, true)
      return `<ValaxyMermaid :code="'${encoded}'" v-bind="${options}" />`
    })

  // restore \`\`\`mermaid with ```mermaid
  md = md.replace(/^````txt\n\\`\\`\\`mermaid/gm, '````txt\n\`\`\`mermaid')

  return md
}
