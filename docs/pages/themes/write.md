---
title: How to write a theme?
title_zh: 如何编写一个 Valaxy 主题
categories:
  - theme
end: false
top: 50
---

::: tip

Valaxy 与 Vite/Vue 的生态完全兼容，因此你在编写主题时，可以任意使用第三方的 `Vite`/`Vue` 插件。

- [Authoring a Plugin | Vite](https://vitejs.dev/guide/api-plugin.html#authoring-a-plugin)
- [Writing a Plugin | Vue](https://vuejs.org/guide/reusability/plugins.html#writing-a-plugin)

:::

Valaxy 主题无需预编译，直接发布源文件即可。

撰写中...

作为 Valaxy 作者，我可以很轻松的实现自己的主题。
但也因此，我可能很难了解真正主题开发者的需求。

因此，如果你有任何开发主题的相关问题，
可前往 QQ 频道[「云乐坊」](https://pd.qq.com/s/grfe9jxoe) 或发起 [Discussions](https://github.com/YunYouJun/valaxy/discussions) 与我交流，我将会为您提供尽可能的帮助，并针对泛化的问题撰写文档。

> 对了，由于目前的主题并不多，主题作者可以在[这里](/themes/gallery)发现一些来自云游君私人的奖励。

## 主题示例

- [valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter): Valaxy 主题开发模版
- [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun): valaxy-theme-yun 一个更完善的主题示例
- [valaxy-theme-press](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press): valaxy-theme-press 当前文档主题示例

## 创建主题模板

::: tip

如果你只想简单点，创建一个自己使用的博客主题而不发布，你可以直接在本地引用你的主题。

可参见 [demo/custom](https://github.com/YunYouJun/valaxy/tree/main/demo/custom)。

:::

```bash
# 使用 valaxy-theme-starter 模版
pnpm create valaxy
# choose Theme
```

在动手之前，我们先来了解一下一个 Valaxy 主题的基础结构，它与正常的用户目录结构也十分相似。

以 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 为例：

> 尽管它们看起来很多，但是大部分都是可选的，你可以根据主题的需求按需编写。

- `App.vue`: 主题的入口文件，用于挂载全局的主题组件
- `README.md`: 主题的说明文档（毫无疑问，这是必不可少的 :P）
- `client`：主题所暴露给用户的客户端辅助函数
  - `index.ts`: 主题的客户端辅助函数入口文件
- `components`: 主题的组件
  - `ValaxyMain.vue`: 主题的文章渲染组件
  - `YunSidebar.vue`: 主题的侧边栏组件
  - `YunSponsor.vue`: 主题的赞助组件
  - `YunWaline.vue`: 第三方评论 Waline 适配组件
- `composables`: 辅助的 Composition API
  - `config.ts`: 主题的配置文件
  - `helper.ts`: 主题的辅助函数
  - `index.ts`: 主题的 Composition API 入口文件
  - `post.ts`: 主题的文章相关的辅助函数
- `docs`: 主题的文档（自由用你喜欢的结构组织并展示吧！）
  > 出于定制化与 [DogFooding](https://zh.wikipedia.org/zh-sg/%E5%90%83%E8%87%AA%E5%B7%B1%E7%9A%84%E7%8B%97%E7%B2%AE) 的考虑，Valaxy 的文档采用自身制作，并制作了一个文档主题 [valaxy-theme-press](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press)，如果你只是想要一个简单轻量的文档站点，[Vitepress](https://vitepress.vuejs.org/) 是个不错的选择。（[valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter) 在未来也许会内置该示例模版。）
  - `en-US`: 英文文档
  - `zh-CN`: 中文文档
- `features`: 主题特色功能，一些不依赖于 Vue Composition API 的功能（区别于 `composables`）
  - `fireworks.ts`: 烟花点击效果
- `layouts`: 主题的布局（扩展更多布局）
  - `default.vue`: 默认布局
  - `home.vue`: 首页布局
  - `layout.vue`: 文章列表布局
  - `post.vue`: 文章布局（放置于 `pages/posts/` 文件夹下的文章默认为 `post 布局）
  - `tags.vue`: 标签布局
- `locales`: 主题的多语言支持
  - `en.yml`: 英文语言文件
  - `zh-CN.yml`: 中文语言文件
- `node_modules`: 主题的依赖（请勿提交至仓库）
- `node`: 主题的 Node 端逻辑
- `package.json`: 主题的相关信息与依赖
- `pages`: 主题的默认页面（扩展更多页面）
  - `index.vue`: 首页
  - `page`: 普通页
    - `[page].vue`: 文章列表页，动态路由，如 `/page/2`
- `setup`: 主题的入口文件（可注册 Vue 插件等）
  - `main.ts`: 主入口文件 `defineAppSetup`
- `stores`: 主题的状态管理
  - `app.ts`: 全局状态管理文件
- `styles`: 主题的样式（`css-vars.scss` 与 `index.scss` 将会被自动引入）
  - `css-vars.scss`: 主题的 CSS 变量
  - `index.scss`: 主题的样式入口文件
- `tsconfig.json`: 主题的 TypeScript 配置
- `types`: 主题的类型声明
  - `index.d.ts`: 主题的类型声明入口文件
- `unocss.config.ts`: 主题的 unocss 配置
- `utils`: 主题的工具函数
- `valaxy.config.ts`: 主题的配置文件

## APIs

我们提供了一个扩展函数，以供你快速扩展页面信息。

<!-- TODO -->

你也可以直接扩展 [unplugin-vue-router](https://github.com/posva/unplugin-vue-router) 插件中的 `extendRoute`。

> <https://github.com/posva/unplugin-vue-router/issues/43#issuecomment-1433140464>

```ts
// valaxy.config.ts
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
import type { EditableTreeNode } from 'unplugin-vue-router'

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

#### Toggle Dark {lang="en"}

#### 切换亮暗模式 {lang="zh-CN"}

::: en

The following variables are stored in global state, which you can get through `useAppStore`.

- `isDark`: Whether dark mode is enabled
- `themeColor`: Theme color (follows `isDark`)
- `toggleDark`: Toggle dark mode
- `toggleDarkWithTransition`: Toggle dark mode with transition

:::

::: zh-CN

以下变量被存储在全局状态中，你可以通过 `useAppStore` 获取。

- `isDark`: 是否启用了暗黑模式
- `themeColor`: 主题色（可跟随 isDark 变化）
- `toggleDark`: 切换暗黑模式
- `toggleDarkWithTransition`: 带有过渡效果的切换暗黑模式

```vue
<script lang="ts" setup>
import { useAppStore } from 'valaxy'

const appStore = useAppStore()
</script>

<template>
  <button class="yun-icon-btn" @click="app.toggleDarkWithTransition">
    <div i="ri-sun-line dark:ri-moon-line" />
  </button>
</template>
```

::: en

> You can configure dark mode related options through `themeConfig.valaxyDarkOptions`.

:::

::: zh-CN

> 你可以通过 `themeConfig.valaxyDarkOptions` 来配置暗黑模式的相关选项。

:::

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

> 你也可以使用你自己的全局状态管理。参见 [状态管理](#状态管理)。

```vue
<!-- valaxy-theme-yun/App.vue -->
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

### ValaxyMain

你需要自定义一个 `ValaxyMain` 组件来决定主题的文章渲染部分。

> 你可以从 `ValaxyMain` 的 `props` 中获取 `frontmatter` 与 `pageData`。

```vue
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

### Markdown 样式

Markdown 样式是主题呈现文章样式的部分，需要由主题自定义。

你可以参考 [valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/) 自定义 Markdown 主题的方式，见 [styles/markdown.scss](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/styles/markdown.scss)。

> 如果你想先使用常见的默认样式（后续再进行定制），你可以直接使用 [star-markdown-css](https://github.com/YunYouJun/star-markdown-css)。
> 使用方式可参见 [valaxy-theme-yun/styles](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/styles/index.scss)

### NProgress 进度条

内置了基础的 [nprogress](https://github.com/rstacruz/nprogress) 样式，你可以通过覆盖 nprogress 的默认样式进行定制：

```scss
// your-theme/styles/index.scss
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

```ts
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

```ts
// composables/config.ts
import { useValaxyConfig } from 'valaxy'
// custom your theme type
import type { YunTheme } from '../types'
/**
 * getThemeConfig
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useValaxyConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
```

```ts
// use
import { useThemeConfig } from 'valaxy-theme-custom'

const themeConfig = useThemeConfig()
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

```ts
// stores/app.ts
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

```vue
<!-- assets/images/valaxy-logo.png -->
<!-- components/ValaxyLogo.vue -->
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

## Third Plugin

### 实现评论

作为博客，用户通常会有评论的需求。

而由于评论系统各不相同，如 Hexo 等主题开发者们通常需在主题侧重复实现多款评论系统。
这显然是繁琐的。

Valaxy 决定通过插件中心化地提供各类封装好的评论组件和辅助函数。

譬如主题开发者，可以借助 `valaxy-addon-waline` 来快速实现 [Waline](https://waline.js.org/) 评论系统的集成。
而用户则可以使用相同的配置穿梭漫游于不同的主题之间。

> 集成参见 [valaxy-addon-waline](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-addon-waline/README.md)。

## FAQ

### 提醒特殊需求的用户安装第三方插件

如果您的主题适配了多个 `addon`，但用户并非都需要安装。
如评论插件：

- `valaxy-addon-waline`
- `valaxy-addon-twikoo`

当用户没有主动安装对应 `addon` 时（即 `addon` 不存在的情况），则会默认重定向至一个空函数。

因此，如果某个插件不是必须的，请在主题文档中提醒想要使用该功能的用户安装对应插件。
