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
})
