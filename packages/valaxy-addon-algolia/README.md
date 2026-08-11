# valaxy-addon-algolia

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-algolia?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-algolia)

**English** | [简体中文](https://valaxy.site/zh/addons/official/algolia)

Add [Algolia DocSearch](https://docsearch.algolia.com/) to a [Valaxy](https://valaxy.site) site.

> [!NOTE]
> The addon currently supports DocSearch. Algolia generally approves DocSearch applications for technical documentation sites.

## Installation

```bash
pnpm add -D valaxy-addon-algolia
```

## Usage

Configure the addon in `valaxy.config.ts`:

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
