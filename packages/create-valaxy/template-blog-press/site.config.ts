import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'en',
  title: 'My Site',
  description: 'My documentation site powered by Valaxy.',
  search: {
    enable: true,
    provider: 'fuse',
  },
})
