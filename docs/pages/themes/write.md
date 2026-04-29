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
please visit the QQ Channel ["Yun Le Fun"](https://pd.qq.com/s/grfe9jxoe) or start a [Discussion](https://github.com/YunYouJun/valaxy/discussions) to communicate with me. I will provide as much help as possible and write documentation for common issues.

> By the way, since there aren't many themes yet, theme authors can discover some personal rewards from YunYouJun [here](/themes/gallery).

## Theme Examples

- [valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter): Valaxy theme development template
- [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun): valaxy-theme-yun, a more complete theme example
- [valaxy-theme-press](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press): valaxy-theme-press, the current documentation theme example

## Creating a Theme Template

::: tip

If you just want to keep things simple and create a blog theme for personal use without publishing, you can directly reference your theme locally.

See [demo/custom](https://github.com/YunYouJun/valaxy/tree/main/demo/custom).

:::

```bash
# Use valaxy-theme-starter template
pnpm create valaxy
# choose Theme
```

Before diving in, let's first understand the basic structure of a Valaxy theme. It is very similar to a normal user directory structure.

Taking [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) as an example:

> Although it may look like a lot, most of these are optional. You can write only what your theme needs.

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
- `tsconfig.json`: Theme's TypeScript configuration
- `types`: Theme type declarations
  - `index.d.ts`: Theme type declarations entry file
- `unocss.config.ts`: Theme's UnoCSS configuration
- `utils`: Theme utility functions
- `valaxy.config.ts`: Theme configuration file

## APIs

We provide an extension function `extendMd` for you to quickly extend page information.

In the theme's `valaxy.config.ts`, you can access each Markdown page's route, frontmatter data, excerpt, and file path through `extendMd`, and modify them at build time.

```ts [valaxy.config.ts]
import { defineTheme } from 'valaxy'

export default defineTheme({
  extendMd(ctx) {
    // ctx.route - EditableTreeNode, you can modify route meta
    // ctx.data  - Readonly frontmatter data parsed from markdown
    // ctx.content - Raw markdown content
    // ctx.excerpt - Excerpt content (if exists)
    // ctx.path  - Absolute file path of the markdown file

    // Example: add custom meta to all pages
    ctx.route.addToMeta({
      frontmatter: {
        customField: 'hello from theme',
      },
    })
  },
})
```

You can also directly extend `extendRoute` from the [`vue-router/vite`](https://router.vuejs.org/file-based-routing/) plugin.

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

`data` is parsed from Markdown frontmatter and is read-only. It will be merged into `route.meta.frontmatter`.

:::

### Client

#### Toggle Dark

The following variables are stored in global state, which you can get through `useAppStore`.

- `isDark`: Whether dark mode is enabled
- `themeColor`: Theme color (follows `isDark`)
- `toggleDark`: Toggle dark mode
- `toggleDarkWithTransition`: Toggle dark mode with transition

```vue [components/YunToggleDark.vue]
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

> You can configure dark mode options through `themeConfig.valaxyDarkOptions`.

::: details Default Theme Config.valaxyDarkOptions

<<< @/../packages/valaxy/types/default-theme.ts {6-41 ts:line-numbers}

:::

### Node

#### Hooks

- [Hooks](/guide/custom/hooks.md)

## Start Writing

### App.vue

> Your entry file

For example, I want to add a global Loading page for the theme.

You can import the global state `useAppStore` from valaxy and use `showLoading` to implement this.

> You can also use your own global state management. See [Global State Management](#global-state-management).

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
  <!-- Add Loading component, components/YunLoading.vue -->
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

You need to customize a `ValaxyMain` component to define the article rendering part of the theme.

> You can get `frontmatter` and `pageData` from the `props` of `ValaxyMain`.

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

> See [ValaxyMain.vue | valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/ValaxyMain.vue) for an example.

## Styles

### Import Default Styles

Valaxy provides some default styles that you need to import in your theme.

For example, create `valaxy-theme-yun/setup/main.ts`:

```ts [setup/main.ts]
import { defineAppSetup, scrollTo } from 'valaxy'
import { nextTick } from 'vue'

// Import valaxy common styles
import 'valaxy/client/styles/common/index.scss'

// You can also import on demand
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

### Markdown Styles

Markdown styles are part of how a theme presents article content and need to be customized by the theme.

You can refer to how [valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/) customizes its Markdown theme. See [styles/markdown.scss](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/styles/markdown.scss).

> If you want to use common default styles first (and customize them later), you can directly use [star-markdown-css](https://github.com/YunYouJun/star-markdown-css).
> See [valaxy-theme-yun/styles](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/styles/index.scss) for usage.

### NProgress Progress Bar

Built-in basic [nprogress](https://github.com/rstacruz/nprogress) styles are included. You can customize them by overriding the default nprogress styles:

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

## Features

### API

> You can also use Valaxy's built-in APIs to quickly implement related features.

#### Get User's Valaxy Config

You can get the user's Valaxy configuration through the built-in `useValaxyConfig`.

::: tip

This configuration corresponds to the user's settings in `valaxy.config.ts`, but it is only used on the client side, so it does not include Node-side configurations (such as `vite`, etc.).

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

#### Provide Typed useThemeConfig

You can provide a theme-specific `useThemeConfig` function so that you and your users can get type-constrained configuration.

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

#### Get Post List

There are two ways to get the post list.

- `usePostList`: Get the post list (not recommended)

```ts
import { usePostList } from 'valaxy'

const postList = usePostList()
```

- `useSiteStore`: Get global site information (recommended)

```ts
const site = useSiteStore()

// site.postList
```

The difference between the two is that `usePostList` is a basic function that fetches all posts and re-filters them on every call, while `useSiteStore` calls `usePostList` once and caches the post list in global state for subsequent use.

(Additionally, `useSiteStore` also implements hot-updating the list when saving posts, e.g., updating the title.)

> [valaxy/packages/valaxy-theme-yun/components/YunPostList.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunPostList.vue) is an example of using `useSiteStore` to display the post list.
> For pagination, see [valaxy-theme-yun/pages/page/[page].vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/pages/page/%5Bpage%5D.vue) and [valaxy-theme-yun/components/YunPostList.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunPostList.vue).

#### Get Post Categories and Tags

After getting the post list, each post in `site.postList` has `categories` and `tags` properties.

You can also use `useCategories` and `useTags` to get all categories and tags, which include the mapping to their corresponding posts.

```ts
import { useCategories, useTags } from 'valaxy'

const categories = useCategories()
const tags = useTags()
```

- [valaxy/packages/valaxy-theme-yun/layouts/categories.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/layouts/categories.vue) is an example of using `useCategories` to display post categories.
- [valaxy/packages/valaxy-theme-yun/layouts/tags.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/layouts/tags.vue) is an example of using `useTags` to display post tags. ([`useYunTags`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/composables/tags.ts) is the theme's wrapper around `useTags`.)

> In `useTags`, `tags` is an object where the key is the tag name and the value is the corresponding post list.
> `useCategories` accepts a `category` parameter (`useCategories('aaa')`) to get the post list for a specific category.

#### Get Front-matter

You can get the current page's Front-matter through `useFrontmatter`.

For example:

```vue
<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'

const fm = useFrontmatter()
</script>

<template>
  <h1>{{ fm.title }}</h1>
</template>
```

#### Global State Management

You can use [Pinia](https://pinia.vuejs.org/) (built into Valaxy) to create your own global state and use it later.

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

#### Previous/Next Post

Navigation for switching between the previous and next post is typically placed at the bottom of an article.

You can implement it yourself using `siteStore.postList`, or use Valaxy's built-in `usePrevNext`.

> See: [valaxy-theme-yun/components/YunPrevNext.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/YunPostNav.vue)

```ts
import { usePrevNext } from 'valaxy'

const [prev, next] = usePrevNext()
// prev/next type is PostFrontMatter
// prev.title prev.path
```

### Table of Contents

If you want to quickly implement a table of contents, Valaxy provides a built-in hook function `useOutline`.

You can use it to quickly get the `headers` (outline information) and corresponding `handleClick` event for article pages. For example:

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

> For more details, see [PressOutline | valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/components/PressOutline.vue).

## Referencing Static Assets

When your theme needs to include some static assets (e.g., images), you can use relative imports. (This also applies in `scss` style files.)

For example, when `assets` and `components` are in the same directory:

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


- [Why | Dep Pre-bundling](https://vitejs.dev/guide/dep-pre-bundling.html#the-why)

To improve the loading performance of subsequent pages, Vite bundles ESM dependencies with many internal modules into a single module.
If your theme depends on some large ESM packages, you can pre-build these dependencies by adding the `optimizeDeps` option.

> `dayjs` has been pre-built by default, you don't need to add it again.
> [Why use dayjs instead of date-fns?](https://api.valaxy.site/notes/app-bundle-size.html#date-fns-vs-dayjs?)


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

### Using Addon Config in Themes {#using-addon-config-in-themes}

When your theme integrates with optional addons (e.g., Algolia search, Waline comments), you can use `useAddonConfig` from `valaxy` to read addon options **without** adding a hard dependency on the addon package.

```vue [components/ThemeSearch.vue]
<script lang="ts" setup>
import type { AlgoliaSearchOptions } from '../types/algolia'
import { useAddonConfig } from 'valaxy'

const algolia = useAddonConfig<AlgoliaSearchOptions>('valaxy-addon-algolia')
// algolia.value is undefined when the addon is not installed
</script>
```

This avoids the previous pattern of using dynamic `import('valaxy-addon-xxx')` with `.then()` / `.catch()`, which was error-prone and not reactive.

### Remind Users with Special Needs to Install Third-party Plugins

If your theme adapts to multiple `addon`s, but not all users need to install them.
Such as comment plugins:

- `valaxy-addon-waline`
- `valaxy-addon-twikoo`

When a user hasn't actively installed the corresponding `addon` (i.e., the `addon` doesn't exist), it will default to redirecting to an empty function.

Therefore, if a plugin is not required, please remind users who want to use this feature to install the corresponding plugin in the theme documentation.
