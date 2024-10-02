import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
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
      name: '项目列表',
      url: 'https://sponsors.yunyoujun.cn/projects',
      icon: 'i-ri-gallery-view',
      color: 'var(--va-c-text)',
    },
    {
      name: '友情链接',
      url: '/links/',
      icon: 'i-ri-link',
      color: 'dodgerblue',
    },
    {
      name: '老婆列表',
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
})
