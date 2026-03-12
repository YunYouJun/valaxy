import { defineCollection } from 'valaxy'

export default defineCollection({
  key: 'links-test',
  title: '合集链接测试',
  cover: 'https://cover.sli.dev',
  description: 'Collection for testing external links and internal links',
  items: [
    { title: '第一章 开始', key: '1' },
    { title: 'Valaxy 官网', link: 'https://valaxy.site' },
    { title: '第二章 旅途', key: '2' },
    { title: 'Hello Valaxy', link: '/posts/hello-valaxy' },
    { title: '第三章 终点', key: '3' },
  ],
})
