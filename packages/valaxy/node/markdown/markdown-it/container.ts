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

function createContainer(classes: string, { icon, color, text: defaultTitle, langs }: BlockItem = {}): ContainerArgs {
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

          let title = `<span lang="en">${info || defaultTitle}</span>`
          if (langs) {
            Object.keys(langs).forEach((lang) => {
              title += `<span lang="${lang}">${info || langs[lang]}</span>`
            })
          }

          return `<div class="${classes} custom-block"><p class="custom-block-title">${iconTag}${title}</p>\n`
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
  /**
   * for i18n
   */
  langs?: { [key: string]: string }
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
    langs: {
      'zh-CN': '提示',
    },
  },
  warning: {
    text: 'WARNING',
    langs: {
      'zh-CN': '注意',
    },
  },
  danger: {
    text: 'DANGER',
    langs: {
      'zh-CN': '警告',
    },
  },
  info: {
    text: 'INFO',
    langs: {
      'zh-CN': '信息',
    },
  },
  details: {
    text: 'Details',
    langs: {
      'zh-CN': '详情',
    },
  },
}

export const containerPlugin = (md: MarkdownIt, options: Blocks = {}) => {
  Object.keys(defaultBlocksOptions).forEach((optionKey) => {
    const option: BlockItem = {
      ...defaultBlocksOptions[optionKey as keyof Blocks],
      ...(options[optionKey as keyof Blocks] || {}),
    }

    md.use(...createContainer(optionKey, option))
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
