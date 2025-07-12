// ref vitepress
// src/node/markdown/plugins/containers.ts

import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'

import type {
  Options,
} from './preWrapper'
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

function createContainer(classes: string, { icon, color, text: defaultTitle, langs }: BlockItem = {}, md: MarkdownItAsync): ContainerArgs {
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
          if (icon)
            iconTag = `<i class="icon ${icon}" ${color ? `style="color: ${color}"` : ''}></i>`

          let titleWithLang = `<span lang="en">${info || defaultTitle}</span>`
          if (langs) {
            Object.keys(langs).forEach((lang) => {
              titleWithLang += `<span lang="${lang}">${info || langs[lang]}</span>`
            })
          }
          const title = md.renderInline(titleWithLang, {})
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

export type ContainerOptions = Blocks & Partial<Options>

const defaultBlocksOptions: ContainerOptions = {
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

export function containerPlugin(md: MarkdownItAsync, containerOptions: ContainerOptions = {}) {
  const blockKeys = new Set(Object.keys(Object.assign(defaultBlocksOptions, containerOptions)))
  blockKeys.forEach((optionKey) => {
    const option: BlockItem = {
      ...defaultBlocksOptions[optionKey as keyof Blocks],
      ...(containerOptions[optionKey as keyof Blocks] || {}),
    }

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

  const languages = ['zh-CN', 'en']
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
