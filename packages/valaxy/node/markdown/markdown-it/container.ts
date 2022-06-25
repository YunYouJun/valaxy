// ref vitepress
// src/node/markdown/plugins/containers.ts

import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import container from 'markdown-it-container'

type ContainerArgs = [
  typeof container,
  string,
  {
    render(tokens: Token[], idx: number): string
  },
]

function createContainer(classes: string, defaultTitle: string, { icon, color }: Omit<BlockItem, 'text'> = {}): ContainerArgs {
  return [
    container,
    classes,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const info = token.info.trim().slice(classes.length).trim()
        if (token.nesting === 1) {
          if (classes === 'details') {
            return `<details class="${classes} custom-block">${
              `<summary>${info}</summary>`
            }\n`
          }
          let iconTag = ''

          if (icon)
            iconTag = `<i class="icon ${icon}" ${color ? `style="color: ${color}"` : ''}></i>`

          return `<div class="${classes} custom-block"><p class="custom-block-title">${iconTag}${
            info || defaultTitle
          }</p>\n`
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

const defaultBlocksOptions: Blocks = {
  tip: {
    text: 'TIP',
  },
  warning: {
    text: 'WARNING',
  },
  danger: {
    text: 'WARNING',
  },
  info: {
    text: 'INFO',
  },
  details: {
    text: 'Details',
  },
}

export const containerPlugin = (md: MarkdownIt, options: Blocks = {}) => {
  Object.keys(defaultBlocksOptions).forEach((optionKey) => {
    const option: BlockItem = {
      ...defaultBlocksOptions[optionKey as keyof Blocks],
      ...(options[optionKey as keyof Blocks] || {}),
    }

    md.use(...createContainer(optionKey, option.text!, option))
  })

  // explicitly escape Vue syntax
  md.use(container, 'v-pre', {
    render: (tokens: Token[], idx: number) =>
      tokens[idx].nesting === 1 ? '<div v-pre>\n' : '</div>\n',
  })

  const languages = ['zh-CN', 'en']
  languages.forEach((lang) => {
    md.use(container, lang, {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div lang="${lang}">\n` : '</div>\n',
    })
  })
}
