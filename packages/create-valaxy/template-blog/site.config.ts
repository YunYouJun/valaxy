import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // Production address used by the sitemap, RSS, and llms.txt.
  // Replace this placeholder before you publish.
  url: 'https://example.com/',
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  title: 'My Blog',
  author: {
    name: 'Your Name',
    avatar: '/favicon.svg',
    email: 'you@example.com',
    link: 'https://example.com/',
  },
  description: 'A blog powered by Valaxy.',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/your-name',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
  ],

  search: {
    enable: false,
  },

  // Tip and sponsor QR codes are off. Uncomment and replace the example to enable them.
  sponsor: {
    enable: false,
    // title: 'Sponsor',
    // methods: [
    //   {
    //     name: 'Example',
    //     url: 'https://example.com/sponsor-qr.png',
    //     color: '#00A3EE',
    //     icon: 'i-ri-heart-line',
    //   },
    // ],
  },

  // `pnpm build` writes dist/llms.txt, dist/llms-full.txt, and post Markdown.
  // That publishes post Markdown with the site. Turn it off with `llms.enable: false`.
  llms: {
    enable: true,
  },
})
