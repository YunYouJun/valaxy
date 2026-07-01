import type { PressTheme } from 'valaxy-theme-press'
import process from 'node:process'
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'
import { addonComponents } from 'valaxy-addon-components'
import { addonGitLog } from 'valaxy-addon-git-log'
import { addonMeting } from 'valaxy-addon-meting'

import { localIconLoader } from 'vitepress-plugin-group-icons'

import pkg from '../packages/valaxy/package.json'

const COMMIT_ID = process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_REF
const commitRef = COMMIT_ID?.slice(0, 8) || 'dev'

const safelist = [
  'i-ri-home-line',

  'i-ri-github-line',

  'i-ri-sparkle-line',
  'i-ri-file-copy-line',
  'i-ri-file-text-line',
  'i-ri-check-line',
  'i-ri-arrow-down-s-line',
  'i-ri-link',
  'i-ri-external-link-line',
  'i-simple-icons-openai',
  'i-simple-icons-claude',
]

const themePressChildItems: PressTheme.SidebarItem[] = [
  { text: 'Config Reference', link: '/themes/press/config' },
  { text: 'Navigation And Sidebar', link: '/themes/press/sidebar-nav' },
  { text: 'Search And i18n', link: '/themes/press/search-i18n' },
  { text: 'Migrating From VitePress', link: '/themes/press/migration' },
]

const themeYunChildItems: PressTheme.SidebarItem[] = [
  { text: 'Config Reference', link: '/themes/yun/config' },
  { text: 'Layout And Visuals', link: '/themes/yun/layout' },
  { text: 'Widgets And Pages', link: '/themes/yun/widgets' },
  { text: 'Customization', link: '/themes/yun/customization' },
]

const themeOverviewItems: PressTheme.SidebarItem[] = [
  { text: 'nav.use-a-theme', link: '/themes/use' },
  { text: 'nav.write-a-theme', link: '/themes/write' },
  {
    text: 'Theme Press',
    link: '/themes/press',
    collapsed: true,
    items: themePressChildItems,
  },
  {
    text: 'Theme Yun',
    link: '/themes/yun',
    collapsed: true,
    items: themeYunChildItems,
  },
  { text: 'nav.themes-gallery', link: '/themes/gallery' },
]

const defaultSidebar: PressTheme.SidebarEntry[] = [
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
  {
    text: 'nav.theme',
    items: themeOverviewItems,
  },
  'addon',
  'dev',
  {
    text: 'nav.dev-notes',
    link: '/posts/',
  },
]

const themePressSidebar: PressTheme.SidebarEntry[] = [
  {
    text: 'Theme Press',
    items: [
      { text: 'Overview', link: '/themes/press' },
      ...themePressChildItems,
    ],
  },
]

const themeYunSidebar: PressTheme.SidebarEntry[] = [
  {
    text: 'Theme Yun',
    items: [
      { text: 'Overview', link: '/themes/yun' },
      ...themeYunChildItems,
    ],
  },
]

const themeOverviewSidebar: PressTheme.SidebarEntry[] = [
  {
    text: 'nav.theme',
    items: themeOverviewItems,
  },
]

const zhThemePressChildItems: PressTheme.SidebarItem[] = [
  { text: '配置参考', link: '/zh/themes/press/config' },
  { text: '导航栏与侧边栏', link: '/zh/themes/press/sidebar-nav' },
  { text: '搜索与多语言', link: '/zh/themes/press/search-i18n' },
  { text: '从 VitePress 迁移', link: '/zh/themes/press/migration' },
]

const zhThemeYunChildItems: PressTheme.SidebarItem[] = [
  { text: '配置参考', link: '/zh/themes/yun/config' },
  { text: '布局与视觉', link: '/zh/themes/yun/layout' },
  { text: '功能组件与页面', link: '/zh/themes/yun/widgets' },
  { text: '自定义', link: '/zh/themes/yun/customization' },
]

const zhThemeOverviewItems: PressTheme.SidebarItem[] = [
  { text: '使用主题', link: '/zh/themes/use' },
  { text: '编写主题', link: '/zh/themes/write' },
  {
    text: '主题 Press',
    link: '/zh/themes/press',
    collapsed: true,
    items: zhThemePressChildItems,
  },
  {
    text: '主题 Yun',
    link: '/zh/themes/yun',
    collapsed: true,
    items: zhThemeYunChildItems,
  },
  { text: '主题橱窗', link: '/zh/themes/gallery' },
]

const zhDefaultSidebar: PressTheme.SidebarEntry[] = [
  'getting-started',
  'guide',
  {
    text: '配置',
    collapsed: false,
    items: [
      {
        text: '基础配置',
        link: '/zh/guide/config/',
      },
      {
        text: '扩展配置',
        link: '/zh/guide/config/extend',
      },
      {
        text: 'UnoCSS 配置',
        link: '/zh/guide/config/unocss-options',
      },
    ],
  },
  'migration',
  'built-ins',
  'third',
  'custom',
  'examples',
  {
    text: '主题',
    items: zhThemeOverviewItems,
  },
  'addon',
  'dev',
  {
    text: '开发笔记',
    link: '/zh/posts/',
  },
]

const zhThemePressSidebar: PressTheme.SidebarEntry[] = [
  {
    text: '主题 Press',
    items: [
      { text: '概览', link: '/zh/themes/press' },
      ...zhThemePressChildItems,
    ],
  },
]

const zhThemeYunSidebar: PressTheme.SidebarEntry[] = [
  {
    text: '主题 Yun',
    items: [
      { text: '概览', link: '/zh/themes/yun' },
      ...zhThemeYunChildItems,
    ],
  },
]

const zhThemeOverviewSidebar: PressTheme.SidebarEntry[] = [
  {
    text: '主题',
    items: zhThemeOverviewItems,
  },
]

export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    title: 'VALAXY',
    url: 'https://valaxy.site',
    description: 'Valaxy Site Docs',

    search: {
      enable: true,
      provider: 'algolia',
    },
    encrypt: {
      enable: true,
    },

    mediumZoom: {
      enable: true,
    },

    lastUpdated: true,

    llms: {
      enable: true,
      files: true,
      include: ['**/*.md'],
    },
  },

  addons: [
    addonAlgolia({
      appId: '7MV77DWO4A',
      apiKey: '9b9438ca112ab7c044c985c2daa1190b',
      indexName: 'valaxysite',
    }),
    addonComponents(),
    addonMeting({
      global: false,
    }),
    addonGitLog({
      contributor: {
        strategy: 'prebuilt',
        // Seed GitHub username resolution from a small, committed cache so
        // builds make near-zero GitHub API calls (no rate-limit / token needed).
        githubCache: 'git-log-contributors.json',
      },
      repositoryUrl: 'https://github.com/YunYouJun/valaxy.git',
    }),
  ],

  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
    sidebar: {
      '/themes/press': themePressSidebar,
      '/themes/yun': themeYunSidebar,
      '/themes/': themeOverviewSidebar,
      '/': defaultSidebar,
    },
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
            text: 'Theme Press',
            link: '/themes/press',
          },
          {
            text: 'Theme Yun',
            link: '/themes/yun',
          },
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
            text: 'nav.dev-notes',
            link: '/posts/',
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

    i18nRouting: true,
    locales: {
      root: {
        label: 'English',
        lang: 'en',
      },
      zh: {
        label: '简体中文',
        lang: 'zh-CN',
        link: '/zh/',
        themeConfig: {
          nav: [
            {
              text: '指南',
              items: [
                {
                  text: '起步',
                  link: '/zh/guide/getting-started',
                },
                {
                  text: '从其他框架迁移',
                  link: '/zh/migration/',
                },
              ],
            },
            {
              text: '配置',
              link: '/zh/guide/config/',
            },
            {
              text: 'API',
              link: 'https://api.valaxy.site/',
            },
            {
              text: '主题',
              items: [
                {
                  text: '主题 Press',
                  link: '/zh/themes/press',
                },
                {
                  text: '主题 Yun',
                  link: '/zh/themes/yun',
                },
                {
                  text: '使用主题',
                  link: '/zh/themes/use',
                },
                {
                  text: '编写主题',
                  link: '/zh/themes/write',
                },
                {
                  text: '主题橱窗',
                  link: '/zh/themes/gallery',
                },
              ],
            },
            {
              text: '插件',
              items: [
                {
                  text: '为什么需要插件？',
                  link: '/zh/addons/why',
                },
                {
                  text: '使用插件',
                  link: '/zh/addons/use',
                },
                {
                  text: '编写插件',
                  link: '/zh/addons/write',
                },
                {
                  text: '插件橱窗',
                  link: '/zh/addons/gallery',
                },
              ],
            },
            {
              text: '生态',
              items: [
                {
                  text: 'VSCode 插件',
                  link: '/zh/ecosystem/vscode',
                },
                {
                  text: '客户端应用',
                  link: '/zh/ecosystem/client',
                },
                {
                  text: '新闻',
                  link: '/zh/ecosystem/news',
                },
                {
                  text: '社区',
                  link: '/zh/ecosystem/community',
                },
                {
                  text: '参与开发',
                  link: '/zh/dev',
                },
                {
                  text: '开发笔记',
                  link: '/zh/posts/',
                },
                {
                  text: '示例站点',
                  link: '/zh/examples/site',
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
          sidebar: {
            '/zh/themes/press': zhThemePressSidebar,
            '/zh/themes/yun': zhThemeYunSidebar,
            '/zh/themes/': zhThemeOverviewSidebar,
            '/zh/': zhDefaultSidebar,
          },
        },
      },
    },
  },

  vite: {
    base: '/',
  },
  unocss: {
    safelist,
  },

  math: true,

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

  groupIcons: {
    customIcon: {
      valaxy: localIconLoader(import.meta.url, './public/favicon.svg'),
      docker: 'vscode-icons:file-type-docker',
      nginx: 'vscode-icons:file-type-nginx',
      toml: 'vscode-icons:file-type-toml',
    },
  },
})
