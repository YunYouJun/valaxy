import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'

import { addonAlgolia } from 'valaxy-addon-algolia'
import { addonBangumi } from 'valaxy-addon-bangumi'
import { addonComponents } from 'valaxy-addon-components'
import { addonLightGallery } from 'valaxy-addon-lightgallery'
import { addonMeting } from 'valaxy-addon-meting'
import { addonTest } from 'valaxy-addon-test'
import { addonWaline } from 'valaxy-addon-waline'

// import { addonTwikoo } from 'valaxy-addon-twikoo'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  devtools: true,
  // site config see site.config.ts or write in siteConfig
  // siteConfig: {},

  theme: 'yun',
  // see theme.config.ts or write in themeConfig
  // themeConfig in theme.config.ts

  unocss: {
    safelist,
  },

  markdown: {
    // default material-theme-palenight
    // theme: 'material-theme-palenight',
    theme: {
      // light: 'material-theme-lighter',
      light: 'github-light',
      // dark: 'material-theme-darker',
      dark: 'github-dark',
    },

    blocks: {
      tip: {
        icon: 'i-carbon-thumbs-up',
        text: 'ヒント',
        langs: {
          'zh-CN': '提示',
        },
      },
      warning: {
        icon: 'i-carbon-warning-alt',
        text: '注意',
      },
      danger: {
        icon: 'i-carbon-warning',
        text: '警告',
      },
      info: {
        text: 'información',
      },
    },

    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, '[!code')
        },
      },
    ],
  },

  addons: [
    addonAlgolia({
      appId: 'UVMHTMG1T5',
      apiKey: '805f2584a8866388aa1631ff0348ddae',
      indexName: 'valaxy',
    }),
    addonBangumi(),
    addonComponents(),
    addonWaline({
      serverURL: 'https://waline.yunyoujun.cn',
      pageview: true,
      comment: true,
    }),
    addonLightGallery(),
    addonMeting({
      global: true,
      props: {
        id: '2049540645',
        server: 'netease',
        type: 'song',
      },
    }),
    // addonTwikoo({
    //   envId: 'https://twikoo.vercel.app',
    // }),
    addonTest(),
  ],
})
