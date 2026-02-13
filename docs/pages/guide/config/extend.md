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

#### LLMS

::: zh-CN

Valaxy 内置了 LLMS 模块，遵循 [llms.txt 标准](https://llmstxt.org/)，在构建时生成 AI 可读的 Markdown 内容。

启用后，构建产物中将包含：

- `/llms.txt` — 站点文章索引，包含指向各 `.md` 文件的链接
- `/llms-full.txt` — 所有文章内容的合集（可选）
- `/posts/*.md` — 每篇文章的原始 Markdown 文件，可通过 URL 直接访问

同时，主题可以利用 `useCopyMarkdown()` composable 为文章页添加「复制 Markdown」按钮（Yun 主题已内置支持）。

- `enable`: 是否启用 LLMS 模块。默认 `false`，关闭。
- `files`: 是否为每篇文章生成独立的 `.md` 文件。默认 `true`。
- `fullText`: 是否生成 `llms-full.txt`（包含所有文章完整内容）。默认 `true`。
- `prompt`: 自定义提示词，添加到 `llms.txt` 的描述部分。默认 `''`。

:::

::: en

Valaxy has a built-in LLMS module, following the [llms.txt standard](https://llmstxt.org/), to generate AI-readable Markdown content during build.

When enabled, the build output will include:

- `/llms.txt` — Post index with links to individual `.md` files
- `/llms-full.txt` — All post content concatenated (optional)
- `/posts/*.md` — Raw Markdown files for each post, accessible via URL

Themes can use the `useCopyMarkdown()` composable to add a "Copy Markdown" button on post pages (built-in support in Yun theme).

- `enable`: Whether to enable the LLMS module. Default is `false`, disabled.
- `files`: Whether to generate individual `.md` files for each post. Default is `true`.
- `fullText`: Whether to generate `llms-full.txt` (with all post content inlined). Default is `true`.
- `prompt`: Custom prompt text, added to the `llms.txt` description section. Default is `''`.

:::

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  modules: {
    llms: {
      enable: true,
      files: true,
      fullText: true,
      prompt: '',
    },
  },
})
```

### CDN Externals {lang="en"}

### CDN 外部化 {lang="zh-CN"}

::: zh-CN

> 实验性功能

通过 `cdn.modules` 配置项，你可以指定某些 npm 包在构建时从 CDN 加载，而非打包到最终产物中。
这可以显著减小构建产物体积，并利用 CDN 加速资源加载。

该配置仅在 `valaxy build` 时生效，开发模式下不受影响。

:::

::: en

> Experimental

With the `cdn.modules` option, you can specify certain npm packages to be loaded from CDN at runtime instead of being bundled.
This can significantly reduce bundle size and leverage CDN for faster resource loading.

This option only takes effect during `valaxy build`, not in dev mode.

:::

::: tip

::: zh-CN
`cdn.modules` 中的每个模块需要提供以下字段：

- `name`: npm 包名（如 `'katex'`）
- `global`: 该库在 `window` 上暴露的全局变量名（如 `'katex'`）
- `url`: CDN 脚本的完整 URL
- `css`（可选）: CDN 样式表的完整 URL
- `exports`（可选）: 需要重新导出的命名导出列表（如 `['ref', 'computed']`）
:::

::: en
Each module in `cdn.modules` requires the following fields:

- `name`: npm package name (e.g., `'katex'`)
- `global`: global variable name the library exposes on `window` (e.g., `'katex'`)
- `url`: full CDN URL to the UMD/IIFE script
- `css` (optional): full CDN URL to the stylesheet
- `exports` (optional): named exports to re-export from the global variable (e.g., `['ref', 'computed']`)
:::

:::

::: zh-CN

#### 示例：通过 CDN 加载 KaTeX

KaTeX 默认会被打包进构建产物。如果你希望通过 CDN 加载 KaTeX 以减小打包体积，可以如下配置：

:::

::: en

#### Example: Load KaTeX from CDN

KaTeX is bundled into the build output by default. If you want to load it from CDN to reduce bundle size, you can configure it as follows:

:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  cdn: {
    modules: [
      {
        name: 'katex',
        global: 'katex',
        url: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js',
        css: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css',
      },
    ],
  },
})
```

::: zh-CN

你也可以使用其他 CDN 源，只需替换 URL 即可。例如使用 unpkg：

:::

::: en

You can also use other CDN providers by replacing the URL. For example, using unpkg:

:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  cdn: {
    modules: [
      {
        name: 'katex',
        global: 'katex',
        url: 'https://unpkg.com/katex@0.16.21/dist/katex.min.js',
        css: 'https://unpkg.com/katex@0.16.21/dist/katex.min.css',
      },
    ],
  },
})
```
