import type { PressTheme } from 'valaxy-theme-press'
import process from 'node:process'
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'
import { addonComponents } from 'valaxy-addon-components'
import { addonGitLog } from 'valaxy-addon-git-log'

import pkg from '../packages/valaxy/package.json'

const COMMIT_ID = process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_REF
const commitRef = COMMIT_ID?.slice(0, 8) || 'dev'

const safelist = [
  'i-ri-home-line',

  'i-ri-github-line',
]

export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    title: 'VALAXY',
    url: 'https://valaxy.site',
    description: 'Valaxy Site Docs',

    search: {
      enable: true,
      type: 'algolia',
    },
    encrypt: {
      enable: true,
    },

    mediumZoom: {
      enable: true,
    },
  },

  addons: [
    addonAlgolia({
      appId: '7MV77DWO4A',
      apiKey: '9b9438ca112ab7c044c985c2daa1190b',
      indexName: 'valaxysite',
    }),
    addonComponents(),
    addonGitLog({
      repositoryUrl: 'https://github.com/YunYouJun/valaxy.git',
    }),
  ],

  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
    sidebar: [
      'getting-started',
      'guide',
      {
        text: 'category.config',
        collapsed: false,
        items: [
          {
            text: 'toc.base-config',
            link: '/guide/config/',
          },
          {
            text: 'toc.extend-config',
            link: '/guide/config/extend',
          },
          {
            text: 'toc.unocss-options',
            link: '/guide/config/unocss-options',
          },
        ],
      },
      'migration',
      'built-ins',
      'third',
      'custom',
      'examples',
      'theme',
      'addon',
      'dev',
    ],
    socialLinks: [
      { icon: 'i-ri-github-line', link: 'https://github.com/YunYouJun/valaxy' },
    ],
    nav: [
      {
        text: 'nav.guide',
        items: [
          {
            text: 'nav.getting-started',
            link: '/guide/getting-started',
          },
          {
            text: 'nav.migrate-from-other',
            link: '/migration/',
          },
        ],
      },
      {
        text: 'nav.config',
        link: '/guide/config/',
      },
      {
        text: 'API',
        link: 'https://api.valaxy.site/',
      },
      {
        text: 'nav.theme',
        items: [
          {
            text: 'nav.use-a-theme',
            link: '/themes/use',
          },
          {
            text: 'nav.write-a-theme',
            link: '/themes/write',
          },
          {
            text: 'nav.themes-gallery',
            link: '/themes/gallery',
          },
        ],
      },
      {
        text: 'nav.addon',
        items: [
          {
            text: 'nav.why-need-addons',
            link: '/addons/why',
          },
          {
            text: 'nav.use-an-addon',
            link: '/addons/use',
          },
          {
            text: 'nav.write-an-addon',
            link: '/addons/write',
          },
          {
            text: 'nav.addons-gallery',
            link: '/addons/gallery',
          },
        ],
      },
      {
        text: 'nav.ecosystem',
        items: [
          {
            text: 'nav.vscode',
            link: '/ecosystem/vscode',
          },
          {
            text: 'nav.client',
            link: '/ecosystem/client',
          },
          {
            text: 'nav.news',
            link: '/ecosystem/news',
          },
          {
            text: 'nav.community',
            link: '/ecosystem/community',
          },
          {
            text: 'nav.dev',
            link: '/dev',
          },
          {
            text: 'nav.examples.site',
            link: '/examples/site',
          },
        ],
      },
      {
        text: pkg.version,
        items: [
          {
            text: 'Release Notes',
            link: 'https://github.com/YunYouJun/valaxy/releases',
          },
        ],
      },
    ],

    footer: {
      message: `Released under the MIT License. (<a href="https://github.com/YunYouJun/valaxy/commit/${commitRef}" target="_blank" alt=${commitRef}>${commitRef}</a>)`,
      copyright:
        'Copyright © 2022-present <a href="https://github.com/YunYouJun" target="_blank">YunYouJun</a> & <a href="https://github.com/YunYouJun/valaxy/graphs/contributors" target="_blank">Valaxy Contributors</a>',
    },
  },

  vite: {
    base: '/',
  },
  unocss: {
    safelist,
  },

  markdown: {
    blocks: {
      tip: {
        icon: 'i-carbon-thumbs-up',
      },
      warning: {
        icon: 'i-carbon-warning-alt',
      },
      danger: {
        icon: 'i-carbon-warning',
      },
      info: {
        icon: 'i-carbon-information',
      },
    },

    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code')
        },
      },
    ],
    // theme: 'material-theme-palenight',
  },
})
