---
title: Extend Config
categories:
  - config
---

::: tip


Extend Config is an advanced configuration provided by Valaxy, allowing you to customize more low-level and build-related settings.

:::


Below are all the extend configuration options and related types.

> [packages/valaxy/node/types/index.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types/index.ts)

::: details package/valaxy/node/types/index.ts ValaxyExtendConfig

<<< @/../packages/valaxy/node/types/index.ts#snippet{ts:line-numbers}

<<< @/../packages/valaxy/node/types/config.ts#snippet{ts:line-numbers}

:::


So you can use it like this:

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

### Build

:::: zh-CN

`build` 字段用于配置 `valaxy build` 的构建行为。

::::

:::: en

The `build` field configures the behavior of `valaxy build`.

::::

#### ssgForPagination

:::: zh-CN

启用后，Valaxy 会为分页页面生成独立的静态 HTML（如 `/page/1`、`/page/2` 等）。默认 `false`。

::::

:::: en

When enabled, Valaxy generates static HTML for pagination pages (e.g., `/page/1`, `/page/2`). Default is `false`.

::::

#### foucGuard

:::: zh-CN

FOUC（Flash of Unstyled Content）防护配置。通过在 `<head>` 中内联 `body { opacity: 0 !important }` 隐藏页面，并通过 JS 监测所有样式表（包括 beasties 异步加载的样式表）加载完成后，移除该隐藏样式标签以显示页面，防止首屏样式闪烁和样式分批渲染的问题。

- `enabled`（默认 `true`）：是否启用 FOUC 防护
- `maxDuration`（默认 `5000`）：最大等待时间（毫秒），作为 CSS 加载失败时的安全兜底。设为 `0` 可禁用超时兜底

::::

:::: en

FOUC (Flash of Unstyled Content) guard. Inlines `body { opacity: 0 !important }` in `<head>` and uses JS to monitor all stylesheets (including async ones loaded by beasties) until they finish loading, then removes the hidden style tag to reveal the page with a smooth fade-in.

- `enabled` (default `true`): enable/disable the guard
- `maxDuration` (default `5000`): max wait time (ms) before force-showing the page. Set to `0` to disable the timeout fallback

::::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  build: {
    ssgForPagination: false,
    foucGuard: {
      enabled: true,
      maxDuration: 5000,
    },
  },
})
```

### @vitejs/plugin-vue


Valaxy integrates [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) by default. You can configure it via the `vue` option.

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


You can refer to the [Vite documentation](https://vite.dev/config/shared-options.html) to customize Vite-related configurations.

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    plugins: []
  }
})
```

### SSG Options


Valaxy uses [vite-ssg](https://github.com/antfu-collective/vite-ssg) for Static Site Generation.
You can customize SSG behavior via `vite.ssgOptions`.


Valaxy sets the following SSG defaults. User values override them:

- `script`: `'async'` — script loading mode
- `formatting`: `'minify'` — HTML output formatting (auto-degrades to `'none'` under low memory)
- `beastiesOptions.preload`: `'media'` — non-critical CSS preload strategy ([see beasties](https://github.com/danielroe/beasties#preload))
- `concurrency` — concurrent page rendering count (auto-adjusted based on available heap memory)
- `onFinished` — auto-generates sitemap after build (always runs; user callback runs after it)

See [ViteSSGOptions](https://github.com/antfu-collective/vite-ssg) for the full parameter list.


:::: warning


**SSG build minimum memory requirement: ~2.3 GB**

vite-ssg runs Vite build and page rendering in the same Node.js process, and memory from the build phase cannot be fully reclaimed. Valaxy auto-adjusts based on V8 heap limits: when heap ≤ 2.5 GB, Critical CSS (beasties) and HTML minify are disabled to save memory.

If you encounter `JavaScript heap out of memory` errors, increase the heap limit:

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
```

See [Dev FAQ - JavaScript heap out of memory](/dev/faq#javascript-heap-out-of-memory) for details.


::::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    ssgOptions: {
      // 输出目录风格: 'flat' | 'nested'
      // flat: /foo → /foo.html
      // nested: /foo → /foo/index.html
      dirStyle: 'nested',

      // 关键 CSS 内联 (beasties) 配置
      // 设为 false 可完全禁用
      beastiesOptions: {
        preload: 'media',
      },

      // 构建完成后的回调（Valaxy 的 sitemap 生成始终会先执行）
      async onFinished() {
        console.log('SSG build finished!')
      },

      // 自定义要生成的路由
      // includedRoutes(paths, routes) {
      //   return paths.filter(p => !p.includes(':'))
      // },

      // 脚本加载模式: 'sync' | 'async' | 'defer' | 'async defer'
      // script: 'async',

      // HTML 格式化: 'none' | 'minify' | 'prettify'
      // formatting: 'minify',

      // SSG 并发数
      // concurrency: 20,
    },
  },
})
```

### Markdown


You can customize Markdown-related configurations, such as code themes, block content, adding `markdown-it` plugins, transformers, etc.

See the effect at: [Markdown](/guide/markdown).

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


Set `devtools: false` to disable DevTools.


### Addons


See [Using Addons](/addons/use).

### UnoCSS


See [UnoCSS](/guide/config/unocss-options).

### Modules

#### RSS


Valaxy has a built-in RSS module, which can be configured in `valaxy.config.ts` through the `modules.rss` configuration item.

- `enable`: Whether to enable the RSS module. Default is `true`, enabled.
- `fullText`: Whether to output the full text of the article. Default is `false`, only the summary is output.
- `extractImagePathsFromHTML`: Whether to extract image paths from built HTML files (to resolve Vite hashed filenames). Default is `true`, enabled.


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


**About `extractImagePathsFromHTML`**

When you reference images with relative paths in Markdown (e.g., `![pic](test.webp)`), Vite will bundle the image and generate a hashed filename (e.g., `/assets/test.zBFFFKJX.webp`).

- When enabled (default): Image URLs in RSS feed will use the actual built paths, like `https://example.com/assets/test.zBFFFKJX.webp`
- When disabled: Image URLs in RSS feed will be constructed based on the post directory, like `https://example.com/posts/article-name/test.webp`

In most cases, you should keep this option as `true` to ensure RSS readers can load images correctly.


#### LLMS


Valaxy has a built-in LLMS module, following the [llms.txt standard](https://llmstxt.org/), to generate AI-readable Markdown content during build.

When enabled, the build output will include:

- `/llms.txt` — Page index grouped by directory, with links to individual `.md` files
- `/llms-full.txt` — All page content concatenated (optional)
- `/*.md` — Raw Markdown files for each page, accessible via URL

Themes can use the `useCopyMarkdown()` composable to add a "Copy Markdown" button on post pages (built-in support in Yun theme).

- `enable`: Whether to enable the LLMS module. Default is `false`, disabled.
- `files`: Whether to generate individual `.md` files for each page. Default is `true`.
- `fullText`: Whether to generate `llms-full.txt` (with all page content inlined). Default is `true`.
- `prompt`: Custom prompt text, added to the `llms.txt` description section. Default is `''`.
- `include`: Glob patterns for markdown files to include (relative to `pages/` directory). Default is `['posts/**/*.md']` to only include posts. Set to `['**/*.md']` to include all markdown files under `pages/`. You can also specify multiple directories, e.g. `['posts/**/*.md', 'guide/**/*.md']`.

Pages in `llms.txt` are automatically grouped by their top-level directory (e.g. `## Posts`, `## Guide`, etc.).


```ts [site.config.ts]
export default defineSiteConfig({
  llms: {
    enable: true,
    files: true,
    fullText: true,
    prompt: '',
    // Default: only posts
    // include: ['posts/**/*.md'],

    // Include all markdown files under pages/
    // include: ['**/*.md'],

    // Include specific directories
    // include: ['posts/**/*.md', 'guide/**/*.md'],
  },
})
```

### CDN Externals


> Experimental

With the `cdn.modules` option, you can specify certain npm packages to be loaded from CDN at runtime instead of being bundled.
This can significantly reduce bundle size and leverage CDN for faster resource loading.

This option only takes effect during `valaxy build`, not in dev mode.


:::: tip


Each module in `cdn.modules` requires the following fields:

- `name`: npm package name (e.g., `'katex'`)
- `global`: global variable name the library exposes on `window` (e.g., `'katex'`)
- `url`: full CDN URL to the UMD/IIFE script
- `css` (optional): full CDN URL to the stylesheet
- `exports` (optional): named exports to re-export from the global variable (e.g., `['ref', 'computed']`)

::::


#### Example: Load KaTeX from CDN


KaTeX is bundled into the build output by default. If you want to load it from CDN to reduce bundle size, you can configure it as follows:

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


You can also use other CDN providers by replacing the URL. For example, using unpkg:


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
