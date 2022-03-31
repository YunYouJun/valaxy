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

function createContainer(classes: string, defaultTitle: string): ContainerArgs {
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
              info ? `<summary>${info}</summary>` : ''
            }\n`
          }
          return `<div class="${classes} custom-block"><p class="custom-block-title">${
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

export const containerPlugin = (md: MarkdownIt) => {
  md.use(...createContainer('tip', 'TIP'))
    .use(...createContainer('info', 'INFO'))
    .use(...createContainer('warning', 'WARNING'))
    .use(...createContainer('danger', 'WARNING'))
    .use(...createContainer('details', 'Details'))
    // explicitly escape Vue syntax
    .use(container, 'v-pre', {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? '<div v-pre>\n' : '</div>\n',
    })
}
