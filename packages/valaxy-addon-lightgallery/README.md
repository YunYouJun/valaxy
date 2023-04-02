# valaxy-addon-lightgallery

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-lightgallery?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-lightgallery)

TODO: English Docs

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
