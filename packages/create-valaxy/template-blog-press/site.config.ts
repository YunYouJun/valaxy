import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // Replace with your deployed site URL before publishing.
  url: 'https://example.com/',
  lang: 'en',
  title: 'My Site',
  description: 'My documentation site powered by Valaxy.',
  search: {
    enable: true,
    provider: 'fuse',
  },
})
