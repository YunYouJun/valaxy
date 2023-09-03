import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'

import { addonAlgolia } from 'valaxy-addon-algolia'

import { addonTwikoo } from 'valaxy-addon-twikoo'

import { addonWaline } from 'valaxy-addon-waline'
import { addonComponents } from 'valaxy-addon-components'
import { addonLightGallery } from 'valaxy-addon-lightgallery'

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
    // bg_image: {},

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
      icon: {
        animated: true,
      },
    },
  },

  unocss: {
    safelist,
  },

  markdown: {
    // default material-theme-palenight
    theme: {
      light: 'material-theme-lighter',
      dark: 'material-theme-darker',
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
  },

  addons: [
    addonAlgolia({
      appId: 'UVMHTMG1T5',
      apiKey: '805f2584a8866388aa1631ff0348ddae',
      indexName: 'valaxy',
    }),
    addonComponents(),
    addonWaline({
      serverURL: 'https://waline.yunyoujun.cn',
      pageview: true,
      comment: true,
    }),
    addonLightGallery(),
    addonTwikoo({
      envId: 'https://twikoo.vercel.app',
    }),
  ],
})
