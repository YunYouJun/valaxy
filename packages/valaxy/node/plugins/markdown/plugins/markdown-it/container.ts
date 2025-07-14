// ref vitepress
// src/node/markdown/plugins/containers.ts

import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'

import container from 'markdown-it-container'
import {
  extractTitle,
} from './preWrapper'

type ContainerArgs = [
  typeof container,
  string,
  {
    render: (tokens: Token[], idx: number) => string
  },
]

function createContainer(key: string, block: BlockItem = {}, md: MarkdownItAsync): ContainerArgs {
  const classes = key
  return [
    container,
    classes,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        if (token.nesting === 1) {
          token.attrJoin('class', `${classes} custom-block`)
          const attrs = md.renderer.renderAttrs(token)
          const info = token.info.trim().slice(classes.length).trim()

          let iconTag = ''
          if (block.icon)
            iconTag = `<i class="icon ${block.icon}" ${block.color ? `style="color: ${block.color}"` : ''}></i>`

          const title = `<VT content="blocks.${key}" />`
          const titleClass
            = `custom-block-title${info ? '' : ' custom-block-title-default'}`

          if (classes === 'details')
            return `<details ${attrs}><summary>${title}</summary>\n`
          return `<div ${attrs}><p class="${titleClass}">${iconTag}${title}</p>\n`
        }
        else {
          return classes === 'details' ? '</details>\n' : '</div>\n'
        }
      },
    },
  ]
}

export interface BlockItem {
  text?: string
  icon?: string
  color?: string
}

export interface Blocks {
  tip?: BlockItem
  warning?: BlockItem
  danger?: BlockItem
  info?: BlockItem
  details?: BlockItem
}

export interface ContainerOptions {
  blocks?: Blocks
  languages?: string[]
}

const defaultBlocksOptions: Blocks = {
  tip: {
    text: 'TIP',
  },
  warning: {
    text: 'WARNING',
  },
  danger: {
    text: 'DANGER',
  },
  info: {
    text: 'INFO',
  },
  details: {
    text: 'Details',
  },
}

export function containerPlugin(md: MarkdownItAsync, containerOptions: ContainerOptions = {}) {
  const blockKeys = new Set(Object.keys(Object.assign({}, defaultBlocksOptions, containerOptions.blocks)))
  blockKeys.forEach((optionKey) => {
    const key = optionKey as keyof Blocks
    const userOption = containerOptions.blocks?.[key] || {}
    const option: BlockItem = Object.assign({}, defaultBlocksOptions[key], userOption)
    md.use(...createContainer(optionKey, option, md))
  })

  // explicitly escape Vue syntax
  md.use(container, 'v-pre', {
    render: (tokens: Token[], idx: number) =>
      tokens[idx].nesting === 1 ? `<div v-pre>\n` : `</div>\n`,
  })
  md.use(container, 'raw', {
    render: (tokens: Token[], idx: number) =>
      tokens[idx].nesting === 1 ? `<div class="vp-raw">\n` : `</div>\n`,
  })

  const languages = containerOptions.languages || ['zh-CN', 'en']
  languages.forEach((lang) => {
    md.use(container, lang, {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div lang="${lang}">\n` : '</div>\n',
    })
  })

  md.use(...createCodeGroup(md))
}

function createCodeGroup(md: MarkdownItAsync): ContainerArgs {
  return [
    container,
    'code-group',
    {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          let tabs = ''
          let checked = 'checked'

          for (
            let i = idx + 1;
            !(
              tokens[i].nesting === -1
              && tokens[i].type === 'container_code-group_close'
            );
            ++i
          ) {
            const isHtml = tokens[i].type === 'html_block'

            if (
              (tokens[i].type === 'fence' && tokens[i].tag === 'code')
              || isHtml
            ) {
              const title = extractTitle(
                isHtml ? tokens[i].content : tokens[i].info,
                isHtml,
              )

              if (title) {
                tabs += `<input type="radio" name="group-${idx}" id="tab-${i}" ${checked}/>`
                tabs += `<label data-title="${md.utils.escapeHtml(title)}" for="tab-${i}">${title}</label>`

                if (checked && !isHtml)
                  tokens[i].info += ' active'
                checked = ''
              }
            }
          }

          return `<div class="vp-code-group"><div class="tabs">${tabs}</div><div class="blocks">\n`
        }
        return `</div></div>\n`
      },
    },
  ]
}
