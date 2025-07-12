---
title:
  en: Extend Config
  zh-CN: 扩展配置
categories:
  - config
---

::: tip

扩展配置是 Valaxy 提供的高阶配置，允许你自定义更多与底层/构建相关的配置。

:::

以下是所有的扩展配置项与相关类型。

> [packages/valaxy/node/type.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types.ts)

::: details package/valaxy/node/types.ts ValaxyExtendConfig

<<< @/../packages/valaxy/node/types.ts#snippet{ts:line-numbers}

:::

::: zh-CN
所以，你可以像这样使用：
:::

::: en
So you can use it like this:
:::

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonComponents } from 'valaxy-addon-components'
import { VitePWA } from 'vite-plugin-pwa'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  siteConfig: {},

  theme: 'yun',
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },

  vite: {
    // https://vite-pwa-org.netlify.app/
    plugins: [VitePWA()],
  },

  unocss: {
    safelist,
  },

  addons: [
    addonComponents()
  ],
})
```

### @vitejs/plugin-vue

Valaxy 默认集成了 [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 插件，你可以通过 `vue` 配置项进行配置。

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('my-')
      }
    }
  }
})
```

### Vite

你可以参见 [Vite 文档](https://vite.dev/config/shared-options.html) 自定义 Vite 相关配置。

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    plugins: []
  }
})
```

### Markdown

可自定义 Markdown 相关配置，如代码主题、区块内容、添加 `markdown-it` 插件、transformer 等。

效果参见: [Markdown](/guide/markdown)。

::: details valaxy/node/plugins/markdown/types.ts

<<< @/../packages/valaxy/node/plugins/markdown/types.ts

:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  markdown: {
    // default material-theme-palenight
    // theme: 'material-theme-palenight',
    theme: {
      // light: 'material-theme-lighter',
      light: 'github-light',
      // dark: 'material-theme-darker',
      dark: 'github-dark',
    },

    blocks: {
      tip: {
        icon: 'i-carbon-thumbs-up',
        text: 'ヒント',
        langs: {
          'zh-CN': '提示',
        },
      },
      warning: {
        icon: 'i-carbon-warning-alt',
        text: '注意',
      },
      danger: {
        icon: 'i-carbon-warning',
        text: '警告',
      },
      info: {
        text: 'información',
      },
    },

    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code')
        },
      },
    ],

    config(md) {
      // md.use(xxx)
    }
  },
})
```

### DevTools

设置 `devtools: false` 以关闭 DevTools。

### 插件 addons

参见 [使用插件](/addons/use)。

### UnoCSS

参见 [UnoCSS](/guide/config/unocss-options)。

### Modules

#### RSS

::: zh-CN

Valaxy 内置了 RSS 模块，你可以在 `valaxy.config.ts` 中通过 `modules.rss` 配置项进行配置。

- `enable`: 是否启用 RSS 模块。默认 `true`，启用。
- `fullText`: 是否输出文章全文。默认 `false`，只输出摘要。

:::

::: en

Valaxy has a built-in RSS module, which can be configured in `valaxy.config.ts` through the `modules.rss` configuration item.

- `enable`: Whether to enable the RSS module. Default is `true`, enabled.
- `fullText`: Whether to output the full text of the article. Default is `false`, only the summary is output.

:::
