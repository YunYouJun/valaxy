# valaxy-addon-lightgallery

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-lightgallery?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-lightgallery)

- [English](./README.md) | **简体中文**

valaxy-addon-lightgallery 基于 [lightgallery](https://github.com/sachinchoolur/lightGallery) 提供画廊预览效果。

## 如何使用

### 安装依赖

```bash
npm i valaxy-addon-lightgallery
```

### 加载插件

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonLightGallery } from 'valaxy-addon-lightgallery'

export default defineValaxyConfig({
  addons: [
    addonLightGallery(),
  ],
})
```

### 在文章中直接使用

直接在 Markdown 中插入组件即可。

```md
---
photos:
  - caption: 我
    src: https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/meme/yun-good-alpha-compressed.png
    desc: 我想起那天夕阳下的奔跑
---
<!-- 相册样式 -->
<VAGallery :photos="frontmatter.photos" />

<!-- 你也可以单独使用照片的样式 -->
<VAPhoto :photo="frontmatter.photos[0]" />
```
