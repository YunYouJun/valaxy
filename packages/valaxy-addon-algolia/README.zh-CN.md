# valaxy-addon-algolia

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-algolia?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-algolia)

[English](https://valaxy.site/addons/official/algolia) | **简体中文**

为 [Valaxy](https://valaxy.site) 站点接入 [Algolia DocSearch](https://docsearch.algolia.com/)。

> [!NOTE]
> 插件目前仅支持 DocSearch。Algolia 通常只接受技术文档站点的 DocSearch 申请。

## 安装

```bash
pnpm add -D valaxy-addon-algolia
```

## 使用

在 `valaxy.config.ts` 中配置插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'

export default defineValaxyConfig({
  addons: [
    addonAlgolia({
      appId: '',
      apiKey: '',
      indexName: '',
    }),
  ],
})
```
