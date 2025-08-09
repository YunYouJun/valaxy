import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  // type: 'strato',
  type: 'nimbo',
  // colors: {
  //   primary: 'red',
  // },
  // bg_image: {},

  banner: {
    enable: true,
    // title: '云游君的小站',
    title: {
      'zh-CN': '云游君的小站',
      'en': ['Yun', 'You', 'Jun', 'Site'],
    },
    siteNameClass: 'bg-gradient-to-r gradient-text from-#1e3c72 to-dark dark:from-#66a6ff dark:to-blue-500',
  },

  notice: {
    enable: true,
    content: '公告测试',
  },

  nav: [
    { text: 'menu.posts', link: '/posts/', icon: 'i-ri-article-line' },
    { text: '项目列表', link: '/projects', icon: 'i-ri-gallery-view' },
    { text: '相册', link: '/albums', icon: 'i-ri-image-line' },
    { text: '友情链接', link: '/links/', icon: 'i-ri-link' },
    { text: '老婆列表', link: '/girls/', icon: 'i-ri-women-line' },
    { text: '赞助者们', link: '/sponsors/', icon: 'i-ri-heart-line' },
  ],

  pages: [
    {
      name: '项目列表',
      url: '/projects',
      icon: 'i-ri-gallery-view',
      color: 'var(--va-c-text)',
    },
    {
      name: '相册',
      url: '/albums',
      icon: 'i-ri-image-line',
      color: 'var(--va-c-text)',
    },
    {
      name: '友情链接',
      url: '/links/',
      icon: 'i-ri-link',
      // color: 'dodgerblue',
    },
    {
      name: '老婆列表',
      url: '/girls/',
      icon: 'i-ri-women-line',
      // color: 'hotpink',
    },
    {
      name: '赞助者们',
      url: '/sponsors/',
      icon: 'i-ri-heart-line',
      color: 'red',
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
