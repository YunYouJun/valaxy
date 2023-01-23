# valaxy-addon-algolia

[Algolia Search](https://www.algolia.com/) for [valaxy](https://valaxy.site).

目前仅支持 [DocSearch](https://docsearch.algolia.com/)。

> DocSearch 通常只接受技术文档的申请。

## Usage

```bash
npm i -D valaxy-addon-algolia
# pnpm add -D valaxy-addon-algolia
```

Write in `valaxy.config.ts`:

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'

export default defineValaxyConfig({
  // 启用评论
  comment: {
    enable: true
  },
  // 设置 valaxy-addon-algolia 配置项
  addons: [
    addonAlgolia({
      appId: '',
      apiKey: '',
      indexName: '',
    }),
  ],
})
```
