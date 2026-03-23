---
title: How to write a theme?
categories:
  - theme
end: false
top: 50
---

::: tip

Valaxy is fully compatible with the Vite/Vue ecosystem, so you can freely use third-party `Vite`/`Vue` plugins when writing themes.

- [Authoring a Plugin | Vite](https://vitejs.dev/guide/api-plugin.html#authoring-a-plugin)
- [Writing a Plugin | Vue](https://vuejs.org/guide/reusability/plugins.html#writing-a-plugin)

:::

Valaxy themes don't need pre-compilation; you can directly publish the source files.

Work in progress...

As the author of Valaxy, I can easily implement my own themes.
However, this also means I may have difficulty understanding the real needs of theme developers.

Therefore, if you have any questions about developing themes,
please visit the QQ Channel ["Yun Le Fang"](https://pd.qq.com/s/grfe9jxoe) or start a [Discussion](https://github.com/YunYouJun/valaxy/discussions) to communicate with me. I will provide as much help as possible and write documentation for common issues.

> By the way, since there aren't many themes yet, theme authors can discover some personal rewards from YunYouJun [here](/themes/gallery).

## Theme Examples

- [valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter): Valaxy theme development template
- [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun): valaxy-theme-yun, a more complete theme example
- [valaxy-theme-press](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press): valaxy-theme-press, the current documentation theme example

## 创建主题模板

::: tip

如果你只想简单点，创建一个自己使用的博客主题而不发布，你可以直接在本地引用你的主题。

可参见 [demo/custom](https://github.com/YunYouJun/valaxy/tree/main/demo/custom)。

:::

```bash
# Use valaxy-theme-starter template
pnpm create valaxy
# choose Theme
```

在动手之前，我们先来了解一下一个 Valaxy 主题的基础结构，它与正常的用户目录结构也十分相似。

以 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 为例：

> 尽管它们看起来很多，但是大部分都是可选的，你可以根据主题的需求按需编写。

- `App.vue`: Theme entry file for mounting global theme components
- `README.md`: Theme documentation (undoubtedly essential :P)
- `client`: Client-side helper functions exposed by the theme to users
  - `index.ts`: Entry file for theme's client-side helper functions
- `components`: Theme components
  - `ValaxyMain.vue`: Theme's article rendering component
  - `YunSidebar.vue`: Theme's sidebar component
  - `YunSponsor.vue`: Theme's sponsor component
  - `YunWaline.vue`: Third-party comment Waline adapter component
- `composables`: Helper Composition API
  - `config.ts`: Theme configuration file
  - `helper.ts`: Theme helper functions
  - `index.ts`: Theme Composition API entry file
  - `post.ts`: Theme's post-related helper functions
- `docs`: Theme documentation (organize and present with your favorite structure!)
  > For customization and [Dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) purposes, Valaxy's documentation is built using itself with a documentation theme [valaxy-theme-press](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press). If you just want a simple and lightweight documentation site, [Vitepress](https://vitepress.vuejs.org/) is a good choice. ([valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter) may include this example template in the future.)
  - `en-US`: English documentation
  - `zh-CN`: Chinese documentation
- `features`: Theme signature features, functions that don't depend on Vue Composition API (different from `composables`)
  - `fireworks.ts`: Fireworks click effect
- `layouts`: Theme layouts (extend more layouts)
  - `default.vue`: Default layout
  - `home.vue`: Home page layout
  - `layout.vue`: Post list layout
  - `post.vue`: Post layout (posts in `pages/posts/` folder default to `post` layout)
  - `tags.vue`: Tags layout
- `locales`: Theme multi-language support
  - `en.yml`: English language file
  - `zh-CN.yml`: Chinese language file
- `node_modules`: Theme dependencies (do not commit to repository)
- `node`: Theme's Node-side logic
- `package.json`: Theme information and dependencies
- `pages`: Theme's default pages (extend more pages)
  - `index.vue`: Home page
  - `page`: Regular page
    - `[page].vue`: Post list page, dynamic route, e.g., `/page/2`
- `setup`: Theme entry file (can register Vue plugins, etc.)
  - `main.ts`: Main entry file `defineAppSetup`
- `stores`: Theme state management
  - `app.ts`: Global state management file
- `styles`: Theme styles
  - `index.ts`: Theme styles entry file
- `tsconfig.json`: 主题的 TypeScript 配置
- `types`: 主题的类型声明
  - `index.d.ts`: 主题的类型声明入口文件
- `unocss.config.ts`: 主题的 unocss 配置
- `utils`: 主题的工具函数
- `valaxy.config.ts`: 主题的配置文件

## APIs

我们提供了一个扩展函数，以供你快速扩展页面信息。

<!-- TODO -->

你也可以直接扩展 [`vue-router/vite`](https://router.vuejs.org/file-based-routing/) 插件中的 `extendRoute`。

> <https://github.com/posva/unplugin-vue-router/issues/43#issuecomment-1433140464> (now part of vue-router)

```ts [valaxy.config.ts]
import { defineTheme } from 'valaxy'

export default defineTheme({
  router: {
    extendRoute(route) {
      // want to get component absolute paths?
      // const path = route.components.get('default')
      console.log(route)
    },
  },
  extendMd(ctx) {
    console.log(ctx.path)
  },
})
```

```ts
import type { EditableTreeNode } from 'vue-router/unplugin'

// provided by valaxy, just as a tip
export interface ValaxyConfig {
  vue?: Parameters<typeof Vue>[0]
  components?: Parameters<typeof Components>[0]
  unocss?: UnoCSSConfig
  pages?: Parameters<typeof Pages>[0]
  extendMd?: (ctx: {
    route: EditableTreeNode
    data: Readonly<Record<string, any>>
    excerpt?: string
    path: string
  }) => void
}
```

::: tip

`data` 解析自 Markdown frontmatter，为原始数据（不可变），将会被合并至 `route.meta.frontmatter` 中。

:::

### Client

#### Toggle Dark


The following variables are stored in global state, which you can get through `useAppStore`.

- `isDark`: Whether dark mode is enabled
- `themeColor`: Theme color (follows `isDark`)
- `toggleDark`: Toggle dark mode
- `toggleDarkWithTransition`: Toggle dark mode with transition


::: details Default Theme Config.valaxyDarkOptions

<<< @/../packages/valaxy/types/default-theme.ts {6-41 ts:line-numbers}

:::

### Node

#### Hooks

- [钩子](/guide/custom/hooks.md)

## 开始编写

### App.vue

> 你的入口文件

譬如我想要为主题添加一个全局的 Loading 页面。

你可以从 valaxy 导入全局状态 `useAppStore`，记录 `showLoading` 来实现。

> 你也可以使用你自己的全局状态管理。参见 [全局状态管理](#全局状态管理)。

```vue [valaxy-theme-yun/App.vue]
<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { useAppStore } from 'valaxy'
import { onMounted } from 'vue'

// ...

const app = useAppStore()
onMounted(() => {
  app.showLoading = false
})
</script>

<template>
  <!-- ... -->
  <!-- 添加 Loading 组件，components/YunLoading.vue -->
  <!-- https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunLoading.vue -->
  <Transition name="fade">
    <YunLoading v-if="app.showLoading" />
  </Transition>
</template>
```

::: tip


- You can completely override the root component through the `ValaxyApp.vue` component to achieve deeper customization needs. (Completely customized by you, no longer default handling such as mounting `router-view`, etc.)

:::

### ValaxyMain

你需要自定义一个 `ValaxyMain` 组件来决定主题的文章渲染部分。

> 你可以从 `ValaxyMain` 的 `props` 中获取 `frontmatter` 与 `pageData`。

```vue [valaxy-theme-yun/components/ValaxyMain.vue]
<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'

defineProps<{
  frontmatter: Post
  data?: PageData
}>()
</script>

<template>
  <main>
    <slot name="main-content">
      <ValaxyMd :frontmatter="frontmatter">
        <slot name="main-content-md" />
        <slot />
      </ValaxyMd>
    </slot>
  </main>
</template>
```

> 示例可参考 [ValaxyMain.vue | valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/ValaxyMain.vue)

## 样式

### 引入默认样式

Valaxy 提供了一些默认样式，你需要在主题中自行引入。

例如，新建 `valaxy-theme-yun/setup/main.ts`:

```ts [setup/main.ts]
import { defineAppSetup, scrollTo } from 'valaxy'
import { nextTick } from 'vue'

// 引入 valaxy 公共样式
import 'valaxy/client/styles/common/index.scss'

// 你也可以按需引入
// common
import 'valaxy/client/styles/common/code.scss'
import 'valaxy/client/styles/common/hamburger.scss'
import 'valaxy/client/styles/common/transition.scss'
// Markdown Style
import 'valaxy/client/styles/common/markdown.scss'

export default defineAppSetup((ctx) => {
  const { router, isClient } = ctx
  if (!isClient)
    return

  router.afterEach((to, from) => {
    if (to.path !== from.path)
      return

    nextTick(() => {
      scrollTo(document.body, to.hash, {
        smooth: true,
      })
    })
  })
})
```

### Markdown 样式

Markdown 样式是主题呈现文章样式的部分，需要由主题自定义。

你可以参考 [valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/) 自定义 Markdown 主题的方式，见 [styles/markdown.scss](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/styles/markdown.scss)。

> 如果你想先使用常见的默认样式（后续再进行定制），你可以直接使用 [star-markdown-css](https://github.com/YunYouJun/star-markdown-css)。
> 使用方式可参见 [valaxy-theme-yun/styles](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/styles/index.scss)

### NProgress 进度条

内置了基础的 [nprogress](https://github.com/rstacruz/nprogress) 样式，你可以通过覆盖 nprogress 的默认样式进行定制：

```scss [your-theme/styles/index.scss]
#nprogress {
  pointer-events: none;

  .bar {
    background: var(--va-c-primary);
    opacity: 0.75;
    position: fixed;
    z-index: 1024;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
  }
}
```

## 功能

### API

> 你还可以使用 Valaxy 内置的 API 以快速实现相关功能。

#### 获取用户的 Valaxy Config

你可以通过内置的 `useValaxyConfig` 获取用户的 Valaxy 配置。

::: tip

这部分配置与用户的 `valaxy.config.ts` 中的配置相对应，但它仅在客户端使用，因此并不包含 Node 端相关配置（如 `vite` 等）。

:::

```ts [composables/config.ts]
import { useSiteConfig, useValaxyConfig } from 'valaxy'
import { useThemeConfig } from 'valaxy-theme-custom'

const config = useValaxyConfig()
// site.config.ts or config.value.siteConfig
const siteConfig = useSiteConfig()
// theme.config.ts or config.value.themeConfig
const themeConfig = useThemeConfig()
```

#### 提供 Typed useThemeConfig

你可以提供一个主题的 `useThemeConfig` 函数，以便自己/用户获得带有类型约束的配置。

```ts [composables/config.ts]
// custom your theme type
import type { YunTheme } from '../types'
import { useValaxyConfig } from 'valaxy'
/**
 * getThemeConfig
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useValaxyConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
```

```vue [components/Example.vue]
<script lang="ts" setup>
import { useThemeConfig } from 'valaxy-theme-custom'

const themeConfig = useThemeConfig()
</script>
```

#### 获取文章列表

获取文章列表有两种方式。

- `usePostList`: 获取文章列表（不推荐）

```ts
import { usePostList } from 'valaxy'

const postList = usePostList()
```

- `useSiteStore`: 获取全局站点信息（推荐）

```ts
const site = useSiteStore()

// site.postList
```

以上两者之间的区别是，`usePostList` 是一个基础函数，每次调用都会获取所有文章并重新过滤一次，而 `useSiteStore` 则会先调用 `usePostList` 并将获取的文章列表缓存在全局的状态中，以供你后续调用。

（此外，`useSiteStore` 还实现了保存文章时（如标题）热更新列表信息的功能。）

> [valaxy/packages/valaxy-theme-yun/components/YunPostList.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunPostList.vue) 是一个使用 `useSiteStore` 展示文章列表的示例。
> 分页功能可参考 [valaxy-theme-yun/pages/page/[page].vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/pages/page/%5Bpage%5D.vue) 与 [valaxy-theme-yun/components/YunPostList.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunPostList.vue)。

#### 获取文章分类与标签

在你获取文章列表后，`site.postList` 中的每篇文章都具有 `categories`（分类） 与 `tags`（标签） 属性。

你还可以通过 `useCategories` 与 `useTags` 获取所有分类、标签，其中便包含了与文章的对应关系。

```ts
import { useCategories, useTags } from 'valaxy'

const categories = useCategories()
const tags = useTags()
```

- [valaxy/packages/valaxy-theme-yun/layouts/categories.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/layouts/categories.vue) 是一个使用 `useCategories` 展示文章分类的示例。
- [valaxy/packages/valaxy-theme-yun/layouts/tags.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/layouts/tags.vue) 是一个使用 `useTags` 展示文章标签的示例。([`useYunTags`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/composables/tags.ts) 是主题对 `useTags` 的封裝。)

> `useTags` 中的 `tags` 为一个对象，其键为标签名，值为对应的文章列表。
> `useCategories` 可传入参数 `category`（`useCategories('aaa')`） 以获取指定分类的文章列表。

#### 获取 Front-matter

你可以通过 `useFrontmatter` 获取当前页面的 Front-matter。

譬如：

```vue
<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'

const fm = useFrontmatter()
</script>

<template>
  <h1>{{ fm.title }}</h1>
</template>
```

#### 全局状态管理

你可以借助 [Pinia](https://pinia.vuejs.org/) （Valaxy 内置）建立自己的全局状态，并在随后使用它，

```ts [stores/app.ts]
import { acceptHMRUpdate, defineStore } from 'pinia'

// custom your theme name
export const useYunAppStore = defineStore('yun-app', () => {
  // global cache for yun

  return {}
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useYunAppStore, import.meta.hot))
```

```ts
// where you want to use
// components/YunExample.vue
import { useYunAppStore } from '../stores/app'

const yun = useYunAppStore()
```

#### 上一篇/下一篇

文章底部通常存在切换上一篇/下一篇的导航。

你可以利用 `siteStore.postList` 自行实现，也可以使用 Valaxy 提供的 `usePrevNext`。

> 可参见：[valaxy-theme-yun/components/YunPrevNext.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunPostNav.vue)

```ts
import { usePrevNext } from 'valaxy'

const [prev, next] = usePrevNext()
// prev/next type is PostFrontMatter
// prev.title prev.path
```

### 目录

如果你想要快速实现一个目录，Valaxy 提供了一个内置钩子函数 `useOutline`。

你可以用它快速获取文章页的目录信息 `headers` 与对应点击事件 `handleClick`，如：

```vue
<script setup lang="ts">
import { useOutline } from 'valaxy'

const { headers, handleClick } = useOutline()
</script>

<template>
  <nav aria-labelledby="doc-outline-aria-label">
    <span id="doc-outline-aria-label" class="visually-hidden">
      Table of Contents
    </span>

    <PressOutlineItem
      class="va-toc relative z-1 css-i18n-toc"
      :headers="headers"
      :on-click="handleClick"
      root
    />
  </nav>
</template>
```

> 更多可参见 [PressOutline | valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/components/PressOutline.vue)。

## 引用静态资源

当主题需要内置一些静态资源（如：图片等），你可以通过相对引用的方式实现。(这在 `scss` 样式文件中也适用)

譬如 `assets` 与 `components` 处于同一目录下时：

```bash
├── components
│   └── ValaxyLogo.vue
└── assets
    └── images
        └── valaxy-logo.png
```

```vue [components/ValaxyLogo.vue]
<script lang="ts" setup>
import valaxyLogoPng from '../assets/images/valaxy-logo.png'
</script>

<template>
  <img max-w="50" m="auto" :src="valaxyLogoPng" alt="Valaxy Logo" z="1">
</template>

<style scoped>
.test-image {
  background-image: url('../assets/images/valaxy-logo.png');
}
</style>
```

## Third Party Plugin

### Implement Comments

As a blog, users typically have commenting needs.

Due to the variety of comment systems, theme developers like Hexo often need to repeatedly implement multiple comment systems on the theme side.
This is obviously tedious.

Valaxy decided to centrally provide various packaged comment components and helper functions through plugins.

For example, theme developers can use `valaxy-addon-waline` to quickly integrate the [Waline](https://waline.js.org/) comment system.
Users can use the same configuration to roam between different themes.

> For integration, see [valaxy-addon-waline](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-addon-waline/README.md).


## Performance Optimization


### Add Dep Pre-bundling `optimizeDeps`


- [Why｜Dep Pre-bundling](https://vitejs.dev/guide/dep-pre-bundling.html#the-why)

To improve the loading performance of subsequent pages, Vite bundles ESM dependencies with many internal modules into a single module.
If your theme depends on some large ESM packages, you can pre-build these dependencies by adding the `optimizeDeps` option.

> `dayjs` has been pre-built by default, you don't need to add it again.


```ts [valaxy.config.ts]
import { defineTheme } from 'valaxy'

export default defineTheme({
  vite: {
    optimizeDeps: {
      include: ['lodash-es'],
    },
  }
})
```

### Remind Users with Special Needs to Install Third-party Plugins

If your theme adapts to multiple `addon`s, but not all users need to install them.
Such as comment plugins:

- `valaxy-addon-waline`
- `valaxy-addon-twikoo`

When a user hasn't actively installed the corresponding `addon` (i.e., the `addon` doesn't exist), it will default to redirecting to an empty function.

Therefore, if a plugin is not required, please remind users who want to use this feature to install the corresponding plugin in the theme documentation.
