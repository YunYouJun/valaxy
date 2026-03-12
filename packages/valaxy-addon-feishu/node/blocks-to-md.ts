/**
 * Feishu block type constants
 * @see https://open.feishu.cn/document/server-docs/docs/docx-v1/document-block/list
 */
const BlockType = {
  PAGE: 1,
  TEXT: 2,
  HEADING1: 3,
  HEADING2: 4,
  HEADING3: 5,
  HEADING4: 6,
  HEADING5: 7,
  HEADING6: 8,
  HEADING7: 9,
  HEADING8: 10,
  HEADING9: 11,
  BULLET: 12,
  ORDERED: 13,
  CODE: 14,
  QUOTE: 15,
  TODO: 17,
  DIVIDER: 19,
  IMAGE: 20,
  TABLE: 22,
  TABLE_CELL: 23,
  CALLOUT: 29,
} as const

interface TextElement {
  text_run?: {
    content: string
    text_element_style?: {
      bold?: boolean
      italic?: boolean
      strikethrough?: boolean
      inline_code?: boolean
      link?: { url: string }
    }
  }
  equation?: {
    content: string
  }
}

interface TextStyle {
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  inline_code?: boolean
  link?: { url: string }
}

export const IMAGE_PLACEHOLDER_PREFIX = '__FEISHU_IMAGE_'
export const IMAGE_PLACEHOLDER_SUFFIX = '__'

export function makeImagePlaceholder(token: string): string {
  return `${IMAGE_PLACEHOLDER_PREFIX}${token}${IMAGE_PLACEHOLDER_SUFFIX}`
}

/**
 * Match image placeholders in markdown and return all tokens.
 */
export function extractImageTokens(markdown: string): string[] {
  const re = new RegExp(`${IMAGE_PLACEHOLDER_PREFIX}([^_]+)${IMAGE_PLACEHOLDER_SUFFIX}`, 'g')
  const tokens: string[] = []
  let m: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(markdown)) !== null)
    tokens.push(m[1])
  return tokens
}

/**
 * Replace image placeholders with actual URLs.
 */
export function replaceImagePlaceholders(
  markdown: string,
  mapping: Record<string, string>,
): string {
  return markdown.replace(
    new RegExp(`${IMAGE_PLACEHOLDER_PREFIX}([^_]+)${IMAGE_PLACEHOLDER_SUFFIX}`, 'g'),
    (_, token) => mapping[token] || `${IMAGE_PLACEHOLDER_PREFIX}${token}${IMAGE_PLACEHOLDER_SUFFIX}`,
  )
}

function formatTextElements(elements: TextElement[] | undefined): string {
  if (!elements || elements.length === 0)
    return ''

  return elements
    .map((el) => {
      if (el.equation)
        return `$${el.equation.content}$`

      if (!el.text_run)
        return ''

      let text = el.text_run.content
      const style: TextStyle = el.text_run.text_element_style || {}

      if (style.inline_code)
        return `\`${text}\``

      if (style.bold)
        text = `**${text}**`
      if (style.italic)
        text = `*${text}*`
      if (style.strikethrough)
        text = `~~${text}~~`
      if (style.link?.url) {
        const url = decodeURIComponent(style.link.url)
        text = `[${text}](${url})`
      }

      return text
    })
    .join('')
}

function getBlockText(block: any): string {
  const data = block.text || block.heading1 || block.heading2 || block.heading3
    || block.heading4 || block.heading5 || block.heading6
    || block.heading7 || block.heading8 || block.heading9
    || block.bullet || block.ordered || block.quote
    || block.todo || block.callout
  return formatTextElements(data?.elements)
}

function processChildren(
  blockMap: Map<string, any>,
  childIds: string[] | undefined,
  indent: number,
  orderedCounters: Map<string, number>,
): string {
  if (!childIds || childIds.length === 0)
    return ''

  const lines: string[] = []
  let prevWasOrdered = false
  for (const id of childIds) {
    const child = blockMap.get(id)
    if (child) {
      // Reset ordered counter when transitioning from non-ordered to ordered
      const isOrdered = child.block_type === BlockType.ORDERED
      if (isOrdered && !prevWasOrdered)
        orderedCounters.delete(`ordered-${indent}`)
      prevWasOrdered = isOrdered
      lines.push(blockToMarkdown(child, blockMap, indent, orderedCounters))
    }
  }
  return lines.join('\n')
}

function blockToMarkdown(
  block: any,
  blockMap: Map<string, any>,
  indent: number = 0,
  orderedCounters: Map<string, number>,
): string {
  const type: number = block.block_type
  const prefix = '  '.repeat(indent)

  switch (type) {
    case BlockType.PAGE:
      return processChildren(blockMap, block.children, indent, orderedCounters)

    case BlockType.TEXT: {
      const text = getBlockText(block)
      return text ? `${prefix}${text}` : ''
    }

    case BlockType.HEADING1:
      return `${prefix}# ${getBlockText(block)}`
    case BlockType.HEADING2:
      return `${prefix}## ${getBlockText(block)}`
    case BlockType.HEADING3:
      return `${prefix}### ${getBlockText(block)}`
    case BlockType.HEADING4:
      return `${prefix}#### ${getBlockText(block)}`
    case BlockType.HEADING5:
      return `${prefix}##### ${getBlockText(block)}`
    case BlockType.HEADING6:
      return `${prefix}###### ${getBlockText(block)}`
    // Markdown only supports h1-h6, render h7-h9 as bold text
    case BlockType.HEADING7:
    case BlockType.HEADING8:
    case BlockType.HEADING9:
      return `${prefix}**${getBlockText(block)}**`

    case BlockType.BULLET: {
      const text = getBlockText(block)
      let result = `${prefix}- ${text}`
      if (block.children?.length) {
        const childMd = processChildren(blockMap, block.children, indent + 1, orderedCounters)
        if (childMd)
          result += `\n${childMd}`
      }
      return result
    }

    case BlockType.ORDERED: {
      // Track ordered list counters per indent level, reset handled by processChildren
      const counterKey = `ordered-${indent}`
      const count = (orderedCounters.get(counterKey) || 0) + 1
      orderedCounters.set(counterKey, count)

      const text = getBlockText(block)
      let result = `${prefix}${count}. ${text}`
      if (block.children?.length) {
        const childMd = processChildren(blockMap, block.children, indent + 1, orderedCounters)
        if (childMd)
          result += `\n${childMd}`
      }
      return result
    }

    case BlockType.CODE: {
      const codeData = block.code
      const language = codeData?.style?.language
        ? mapCodeLanguage(codeData.style.language)
        : ''
      const codeText = formatTextElements(codeData?.elements)
      return `${prefix}\`\`\`${language}\n${codeText}\n${prefix}\`\`\``
    }

    case BlockType.QUOTE: {
      const text = getBlockText(block)
      let result = `${prefix}> ${text}`
      if (block.children?.length) {
        const childMd = processChildren(blockMap, block.children, indent, orderedCounters)
        if (childMd)
          result += `\n${childMd.split('\n').map(l => `${prefix}> ${l}`).join('\n')}`
      }
      return result
    }

    case BlockType.TODO: {
      const todoData = block.todo
      const checked = todoData?.style?.done ? 'x' : ' '
      const text = formatTextElements(todoData?.elements)
      return `${prefix}- [${checked}] ${text}`
    }

    case BlockType.DIVIDER:
      return `${prefix}---`

    case BlockType.IMAGE: {
      const imageData = block.image
      const token = imageData?.token
      if (token) {
        return `${prefix}![](${makeImagePlaceholder(token)})`
      }
      return ''
    }

    case BlockType.TABLE: {
      return convertTable(block, blockMap, orderedCounters)
    }

    case BlockType.CALLOUT: {
      const calloutData = block.callout
      const emoji = calloutData?.emoji_id || ''
      let result = `${prefix}> ${emoji ? `${emoji} ` : ''}`
      if (block.children?.length) {
        const childMd = processChildren(blockMap, block.children, 0, orderedCounters)
        result += childMd.split('\n').join(`\n${prefix}> `)
      }
      return result
    }

    default:
      return ''
  }
}

function convertTable(
  block: any,
  blockMap: Map<string, any>,
  orderedCounters: Map<string, number>,
): string {
  const tableData = block.table
  if (!tableData)
    return ''

  const rows = tableData.property?.row_size || 0
  const cols = tableData.property?.column_size || 0
  const cellIds: string[] = block.children || []

  if (rows === 0 || cols === 0)
    return ''

  const lines: string[] = []

  for (let r = 0; r < rows; r++) {
    const cells: string[] = []
    for (let c = 0; c < cols; c++) {
      const cellId = cellIds[r * cols + c]
      const cell = cellId ? blockMap.get(cellId) : undefined
      if (cell?.children?.length) {
        const cellContent = processChildren(blockMap, cell.children, 0, orderedCounters)
        cells.push(cellContent.replace(/\n/g, '<br>').trim())
      }
      else {
        cells.push('')
      }
    }
    lines.push(`| ${cells.join(' | ')} |`)

    // Add header separator after first row
    if (r === 0) {
      lines.push(`| ${Array.from({ length: cols }).fill('---').join(' | ')} |`)
    }
  }

  return lines.join('\n')
}

/**
 * Map Feishu code block language IDs to markdown language identifiers.
 */
function mapCodeLanguage(lang: number | string): string {
  const langMap: Record<string, string> = {
    1: 'plaintext',
    2: 'abap',
    3: 'ada',
    4: 'apache',
    5: 'apex',
    6: 'assembly',
    7: 'bash',
    8: 'basic',
    9: 'bnf',
    10: 'c',
    11: 'c++',
    12: 'c#',
    13: 'clojure',
    14: 'coffeescript',
    15: 'css',
    16: 'd',
    17: 'dart',
    18: 'delphi',
    19: 'django',
    20: 'dockerfile',
    21: 'elixir',
    22: 'erlang',
    23: 'fortran',
    24: 'go',
    25: 'groovy',
    26: 'haskell',
    27: 'html',
    28: 'http',
    29: 'java',
    30: 'javascript',
    31: 'json',
    32: 'julia',
    33: 'kotlin',
    34: 'latex',
    35: 'lisp',
    36: 'lua',
    37: 'makefile',
    38: 'markdown',
    39: 'matlab',
    40: 'nginx',
    41: 'objective-c',
    42: 'ocaml',
    43: 'perl',
    44: 'php',
    45: 'powershell',
    46: 'prolog',
    47: 'protobuf',
    48: 'python',
    49: 'r',
    50: 'ruby',
    51: 'rust',
    52: 'sas',
    53: 'scala',
    54: 'scheme',
    55: 'scss',
    56: 'shell',
    57: 'sql',
    58: 'swift',
    59: 'thrift',
    60: 'typescript',
    61: 'vbscript',
    62: 'visual-basic',
    63: 'xml',
    64: 'yaml',
  }
  return langMap[String(lang)] || ''
}

/**
 * Convert an array of Feishu document blocks to a markdown string.
 * The first block is usually the page block (type 1), whose children
 * reference all top-level content blocks.
 */
export function blocksToMarkdown(blocks: any[]): string {
  if (!blocks || blocks.length === 0)
    return ''

  // Build a map of block_id -> block for fast lookup
  const blockMap = new Map<string, any>()
  for (const block of blocks)
    blockMap.set(block.block_id, block)

  // Find the page block (type 1) — it's the root
  const pageBlock = blocks.find(b => b.block_type === BlockType.PAGE)
  if (!pageBlock)
    return ''

  const orderedCounters = new Map<string, number>()
  const childIds = pageBlock.children || []
  const lines: string[] = []
  let prevType: number | null = null

  for (const id of childIds) {
    const block = blockMap.get(id)
    if (!block)
      continue

    // Reset ordered counter when a non-ordered block breaks the sequence
    if (block.block_type !== BlockType.ORDERED && prevType === BlockType.ORDERED)
      orderedCounters.clear()

    const md = blockToMarkdown(block, blockMap, 0, orderedCounters)
    if (md !== '')
      lines.push(md)

    prevType = block.block_type
  }

  return lines.join('\n\n')
}
