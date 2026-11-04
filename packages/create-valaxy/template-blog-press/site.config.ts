import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // Replace with your deployed site URL before publishing.
  url: 'https://example.com/',
  lang: 'en',
  timezone: 'UTC',
  title: 'My Site',
  author: {
    name: 'Your Name',
    avatar: '/favicon.svg',
    email: 'you@example.com',
    link: 'https://example.com/',
  },
  description: 'My documentation site powered by Valaxy.',
  search: {
    enable: true,
    provider: 'fuse',
  },

  // `pnpm build` writes dist/llms.txt, dist/llms-full.txt, and post Markdown.
  // That publishes post Markdown with the site. Turn it off with `llms.enable: false`.
  llms: {
    enable: true,
  },
})
