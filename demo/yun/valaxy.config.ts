import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'
// import { VitePWA } from 'vite-plugin-pwa'
import Inspect from 'vite-plugin-inspect'
import { addonAlgolia } from 'valaxy-addon-algolia'
import { addonTwikoo } from 'valaxy-addon-twikoo'
// import { addonWaline } from 'valaxy-addon-waline'
import { addonComponents } from 'valaxy-addon-components'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  // siteConfig: {},

  theme: 'yun',
  themeConfig: {
    // colors: {
    //   primary: 'red',
    // },

    banner: {
      enable: true,
      title: '云游君的小站',
    },

    notice: {
      enable: true,
      content: '公告测试',
    },

    pages: [
      {
        name: '我的小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      },
      {
        name: '喜欢的女孩子',
        url: '/girls/',
        icon: 'i-ri-women-line',
        color: 'hotpink',
      },
    ],

    footer: {
      since: 2016,
      beian: {
        enable: true,
        icp: '苏ICP备17038157号',
      },
    },
  },

  vite: {
    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    plugins: [Inspect()],
  },

  unocss: {
    safelist,
  },

  markdown: {
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
  },

  addons: [
    addonAlgolia({
      appId: 'UVMHTMG1T5',
      apiKey: '805f2584a8866388aa1631ff0348ddae',
      indexName: 'valaxy',
    }),
    addonComponents(),
    // addonWaline({
    //   serverURL: 'https://waline.yunyoujun.cn',
    //   pageview: true,
    //   comment: true,
    // }),
    addonTwikoo({
      envId: 'https://twikoo.vercel.app',
    }),
  ],
})
