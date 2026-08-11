# valaxy-addon-bangumi

**English** | [简体中文](https://valaxy.site/zh/addons/official/bangumi)

Display Bilibili and Bangumi watch lists in Valaxy through the `ValaxyBangumi` component.

The addon uses [bilibili-bangumi-component](https://github.com/yixiaojiu/bilibili-bangumi-component) and requires a backend service. Follow its [backend guide](https://github.com/yixiaojiu/bilibili-bangumi-component/blob/main/docs/backend.md) to deploy one.

## Installation

```bash
pnpm add valaxy-addon-bangumi
```

## Configuration

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonBangumi } from 'valaxy-addon-bangumi'

export default defineValaxyConfig({
  addons: [
    addonBangumi({
      api: 'https://your-bangumi-api.example.com',
      bilibiliUid: '1579790',
      bgmEnabled: false,
    }),
  ],
})
```

Use the registered component in Markdown:

```md
---
title: Bangumi watch list
keywords: Bangumi
description: My Bangumi watch list
---

<ValaxyBangumi />
```

## Style overrides

`bilibili-bangumi-component` is implemented as a Web Component. Because Shadow DOM isolates its styles, pass `customCss` through the addon options:

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonBangumi } from 'valaxy-addon-bangumi'

export default defineValaxyConfig({
  addons: [
    addonBangumi({
      customCss: '.bbc-bangumi-title a { color: red; }',
    }),
  ],
})
```

## API

| Field | Description | Type | Default |
| --- | --- | --- | --- |
| `api` | Backend API URL | `string` | — |
| `bilibiliUid` | Bilibili UID; optional when the backend supplies it through environment variables | `string` | — |
| `bgmUid` | Bangumi UID; optional when the backend supplies it through environment variables | `string` | — |
| `bilibiliEnabled` | Display Bilibili entries | `boolean` | `true` |
| `bgmEnabled` | Display Bangumi entries | `boolean` | `true` |
| `pageSize` | Number of entries per page | `number` | `15` |
| `customEnabled` | Enable a custom data source | `boolean` | `false` |
| `customLabel` | Label for the custom data source | `string` | `'Custom'` |
| `customCss` | CSS injected into the Web Component | `string` | — |
