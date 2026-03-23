---
title: Third Comment System
categories:
  - third
---

There are many third-party comment systems. Below is a brief introduction to how to integrate various comment systems.

> [My Views on Third-Party Comment Systems](https://www.yunyoujun.cn/posts/third-party-comment-system)

## Waline

> [Waline](https://waline.js.org/) is a server-side comment system that can be hosted on platforms like Vercel.

Integrate using [valaxy-addon-waline](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-addon-waline/README.md).

> valaxy-addon-waline is a Valaxy plugin based on Waline.
> Additionally, we recommend using [kotodama](https://github.com/YunYouJun/kotodama) for comment management, which is a comment management system based on Waline's server-side implementation.

### Installation

```bash
npm i valaxy-addon-waline
# pnpm add valaxy-addon-waline
```

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  // or write it in site.config.ts
  siteConfig: {
    // Enable comments
    comment: {
      enable: true
    },
  },
  // Set valaxy-addon-waline configuration
  addons: [
    addonWaline({
      // Waline configuration, see https://waline.js.org/reference/client/props.html
      serverURL: 'https://your-waline-url',
    }),
  ],
})
```

## Utterances

> [Utterances](https://utteranc.es/) is a comment system based on GitHub Issues.

It can be integrated directly by mounting a JS script.

Create `App.vue` in the blog root directory and add the mounting script:

<<< @/../demo/yun/App.vue

<<< @/../demo/yun/composables/use-utterances.ts
