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

> [packages/valaxy/node/types/index.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types/index.ts)

::: details package/valaxy/node/types/index.ts ValaxyExtendConfig

<<< @/../packages/valaxy/node/types/index.ts#snippet{ts:line-numbers}

<<< @/../packages/valaxy/node/types/config.ts#snippet{ts:line-numbers}

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
- `extractImagePathsFromHTML`: 是否从构建后的 HTML 中提取图片路径（用于解析 Vite 打包后的 hash 文件名）。默认 `true`，启用。

:::

::: en

Valaxy has a built-in RSS module, which can be configured in `valaxy.config.ts` through the `modules.rss` configuration item.

- `enable`: Whether to enable the RSS module. Default is `true`, enabled.
- `fullText`: Whether to output the full text of the article. Default is `false`, only the summary is output.
- `extractImagePathsFromHTML`: Whether to extract image paths from built HTML files (to resolve Vite hashed filenames). Default is `true`, enabled.

:::

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  modules: {
    rss: {
      enable: true,
      fullText: false,
      // 当设置为 true 时，会从构建后的 HTML 中提取图片的实际路径（包含 hash）
      // When set to true, it will extract actual image paths (with hash) from built HTML
      extractImagePathsFromHTML: true,
    },
  },
})
```

::: zh-CN

**关于 `extractImagePathsFromHTML`**

当你在 Markdown 中使用相对路径引用图片时（如 `![pic](test.webp)`），Vite 会将图片打包并生成带 hash 的文件名（如 `/assets/test.zBFFFKJX.webp`）。

- 启用此选项（默认）：RSS feed 中的图片 URL 将使用构建后的实际路径，如 `https://example.com/assets/test.zBFFFKJX.webp`
- 禁用此选项：RSS feed 中的图片 URL 将基于文章目录构建，如 `https://example.com/posts/article-name/test.webp`

大多数情况下，你应该保持此选项为 `true`，以确保 RSS 阅读器能正确加载图片。

:::

::: en

**About `extractImagePathsFromHTML`**

When you reference images with relative paths in Markdown (e.g., `![pic](test.webp)`), Vite will bundle the image and generate a hashed filename (e.g., `/assets/test.zBFFFKJX.webp`).

- When enabled (default): Image URLs in RSS feed will use the actual built paths, like `https://example.com/assets/test.zBFFFKJX.webp`
- When disabled: Image URLs in RSS feed will be constructed based on the post directory, like `https://example.com/posts/article-name/test.webp`

In most cases, you should keep this option as `true` to ensure RSS readers can load images correctly.

:::
