# valaxy-addon-lightgallery

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-lightgallery?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-lightgallery)

- **English** | [简体中文](./README.zh-CN.md)

valaxy-addon-lightgallery provides a gallery preview effect based on [lightgallery](https://github.com/sachinchoolur/lightGallery).

## How to use

### Install dependencies

```bash
npm i valaxy-addon-lightgallery
```

### Load the plugin

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonLightGallery } from 'valaxy-addon-lightgallery'

export default defineValaxyConfig({
  addons: [
    addonLightGallery(),
  ],
})
```

### Use directly in the article

Insert the component directly in Markdown.

```md
---
photos:
  - caption: Me
    src: https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/meme/yun-good-alpha-compressed.png
    desc: 'I remember the run under the sunset that day.'
---
<!-- The style of gallery -->
<VAGallery :photos="frontmatter.photos" />

<!-- You can also use the style of the photo separately -->
<VAPhoto :photo="frontmatter.photos[0]" />
```

## FAQ

### Rollup failed to resolve import "lightgallery/vue/LightGalleryVue.umd.min.js"

- [Vue bundle missing from npm package | sachinchoolur/lightGallery](https://github.com/sachinchoolur/lightGallery/issues/1671)

Lock packages.json dependencies version to `"lightgallery": "2.7.2"`.
