---
title: 扩展配置
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

所以，你可以像这样使用：

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

### Build {#build}

`build` 字段用于配置 `valaxy build` 的构建行为。

#### ssgForPagination {#ssgforpagination}

启用后，Valaxy 会为分页页面生成独立的静态 HTML（如 `/page/1`、`/page/2` 等）。默认 `false`。

#### foucGuard {#foucguard}

FOUC（Flash of Unstyled Content）防护配置。通过在 `<head>` 中内联 `body { opacity: 0 !important }` 隐藏页面，并通过 JS 监测所有样式表（包括 beasties 异步加载的样式表）加载完成后，移除该隐藏样式标签以显示页面，防止首屏样式闪烁和样式分批渲染的问题。

- `enabled`（默认 `true`）：是否启用 FOUC 防护
- `maxDuration`（默认 `5000`）：最大等待时间（毫秒），作为 CSS 加载失败时的安全兜底。设为 `0` 可禁用超时兜底

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

### @vitejs/plugin-vue {#vitejsplugin-vue}

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

### Vite {#vite}

你可以参见 [Vite 文档](https://vite.dev/config/shared-options.html) 自定义 Vite 相关配置。

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    plugins: []
  }
})
```

### SSG Options {#ssg-options}

Valaxy 使用 [vite-ssg](https://github.com/antfu-collective/vite-ssg) 进行静态站点生成。
你可以通过 `vite.ssgOptions` 自定义 SSG 行为。

Valaxy 默认设置了以下 SSG 选项，用户配置会覆盖这些默认值：

- `script`: `'async'` — 脚本加载模式
- `formatting`: `'minify'` — HTML 输出格式（低内存时自动降级为 `'none'`）
- `beastiesOptions.preload`: `'media'` — 非关键 CSS 预加载策略（[详见 beasties](https://github.com/danielroe/beasties#preload)）
- `concurrency` — 并发渲染页面数（根据可用堆内存自动调整）
- `onFinished` — 构建完成后自动生成 sitemap（始终执行，用户回调会在其后运行）

完整参数列表请参见 [ViteSSGOptions](https://github.com/antfu-collective/vite-ssg)。
 warning

**SSG 构建最低内存要求：~2.3 GB**

vite-ssg 在同一 Node.js 进程中执行 Vite 构建和页面渲染，构建阶段的内存无法完全释放。Valaxy 会根据 V8 堆限制自动调整：堆 ≤ 2.5 GB 时禁用 Critical CSS（beasties）和 HTML minify 以节省内存。

如果遇到 `JavaScript heap out of memory` 错误，请增大堆限制：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
```

详见 [开发 FAQ - JavaScript heap out of memory](/zh/dev/faq#javascript-heap-out-of-memory)。
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

### Markdown {#markdown}

可自定义 Markdown 相关配置，如代码主题、区块内容、添加 `markdown-it` 插件、transformer 等。

效果参见: [Markdown](/zh/guide/markdown)。

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

### DevTools {#devtools}

设置 `devtools: false` 以关闭 DevTools。

### 插件 Addons {#addons}

参见 [使用插件](/zh/addons/use)。

### UnoCSS {#unocss}

参见 [UnoCSS](/zh/guide/config/unocss-options)。

### Modules {#modules}

#### RSS {#rss}

Valaxy 内置了 RSS 模块，你可以在 `valaxy.config.ts` 中通过 `modules.rss` 配置项进行配置。

- `enable`: 是否启用 RSS 模块。默认 `true`，启用。
- `fullText`: 是否输出文章全文。默认 `false`，只输出摘要。
- `extractImagePathsFromHTML`: 是否从构建后的 HTML 中提取图片路径（用于解析 Vite 打包后的 hash 文件名）。默认 `true`，启用。

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

**关于 `extractImagePathsFromHTML`**

当你在 Markdown 中使用相对路径引用图片时（如 `![pic](test.webp)`），Vite 会将图片打包并生成带 hash 的文件名（如 `/assets/test.zBFFFKJX.webp`）。

- 启用此选项（默认）：RSS feed 中的图片 URL 将使用构建后的实际路径，如 `https://example.com/assets/test.zBFFFKJX.webp`
- 禁用此选项：RSS feed 中的图片 URL 将基于文章目录构建，如 `https://example.com/posts/article-name/test.webp`

大多数情况下，你应该保持此选项为 `true`，以确保 RSS 阅读器能正确加载图片。

#### LLMS {#llms}

Valaxy 内置了 LLMS 模块，遵循 [llms.txt 标准](https://llmstxt.org/)，在构建时生成 AI 可读的 Markdown 内容。

启用后，构建产物中将包含：

- `/llms.txt` — 站点页面索引，按目录分组，包含指向各 `.md` 文件的链接
- `/llms-full.txt` — 所有页面内容的合集（可选）
- `/*.md` — 每个页面的原始 Markdown 文件，可通过 URL 直接访问

同时，主题可以利用 `useCopyMarkdown()` composable 为文章页添加「复制 Markdown」按钮（Yun 主题已内置支持）。

- `enable`: 是否启用 LLMS 模块。默认 `false`，关闭。
- `files`: 是否为每个页面生成独立的 `.md` 文件。默认 `true`。
- `fullText`: 是否生成 `llms-full.txt`（包含所有页面完整内容）。默认 `true`。
- `prompt`: 自定义提示词，添加到 `llms.txt` 的描述部分。默认 `''`。
- `include`: 要包含的 Markdown 文件 glob 模式（相对于 `pages/` 目录）。默认 `['posts/**/*.md']` 仅包含 posts 目录。设为 `['**/*.md']` 可包含所有 `pages/` 下的 Markdown 文件，也可指定多个目录如 `['posts/**/*.md', 'guide/**/*.md']`。

`llms.txt` 中的页面会按顶级目录自动分组（如 `## Posts`、`## Guide` 等）。

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

### CDN 外部化 {#cdn-externals}

> 实验性功能

通过 `cdn.modules` 配置项，你可以指定某些 npm 包在构建时从 CDN 加载，而非打包到最终产物中。
这可以显著减小构建产物体积，并利用 CDN 加速资源加载。

该配置仅在 `valaxy build` 时生效，开发模式下不受影响。

::: tip

`cdn.modules` 中的每个模块需要提供以下字段：

- `name`: npm 包名（如 `'katex'`）
- `global`: 该库在 `window` 上暴露的全局变量名（如 `'katex'`）
- `url`: CDN 脚本的完整 URL
- `css`（可选）: CDN 样式表的完整 URL
- `exports`（可选）: 需要重新导出的命名导出列表（如 `['ref', 'computed']`）

:::

#### 示例：通过 CDN 加载 KaTeX {#example-load-katex-from-cdn}

KaTeX 默认会被打包进构建产物。如果你希望通过 CDN 加载 KaTeX 以减小打包体积，可以如下配置：

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

你也可以使用其他 CDN 源，只需替换 URL 即可。例如使用 unpkg：

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

