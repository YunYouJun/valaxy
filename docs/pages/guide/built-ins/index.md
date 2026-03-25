---
title: Components
categories:
  - guide
end: false
---


Valaxy has several simple components built in.

You can use them directly when writing articles or themes.


::: tip

<div flex items="center" pb-1><div inline-flex i-logos:vue /> <span ml-1 inline-flex>Based on Vue components</span></div>

:::


## Basic Components


::: info

Built for theme developers (common users usually do not need to use them directly)

:::


### Layout and Rendering


- [`ValaxyMain.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMain.vue): Basic page layout
- [`ValaxyMd.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMd.vue): Rendered Markdown content


### Others


- [`AppLink.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/AppLink.vue): The link automatically determines whether it is an intra-site link. Use `<router-link/>` for intra-site links and `<a target=" blank"></a>`for external links.
- [`ValaxyCopyright.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyCopyright.vue): The copyright information in the article.
- [`ValaxyDecrypt.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyDecrypt.vue): Text decryption component
- [`ValaxyGalleryDecrypt.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyGalleryDecrypt.vue): Picture decryption component
- [`ValaxyLogo.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyLogo.vue): Valaxy Logo with gradient color
- [`ValaxySvgLogo.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxySvgLogo.vue>): Valaxy SVG Logo
- [`ValaxyPagination.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyPagination.vue>): Paging component
- [`ValaxyOverlay.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyOverlay.vue>): Grey mask component
- [`ValaxyHamburger.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyHamburger.vue>): Hamburger button


```md
<ValaxyLogo />
```

<ValaxyLogo />


## Helper Components

### 内置组件


> For users, can be used directly.

You can also extend public components by [valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components).


#### Internationalization Component `<VT />`

```yaml [locales/zh-CN.yml]
menu:
  posts: 博客文章
```

```yaml [locales/en.yml]
menu:
  posts: Posts
```

```md
<!-- auto follow locale -->
<VT content="menu.posts" />
```

<VT content="menu.posts" />

### 扩展公共组件

```bash [pnpm]
pnpm add valaxy-addon-components
```

如：


- `CodePen`: CodePen code snippets
- `VCLiveTime`: The establishment time of the site


```md [pages/posts/your-post.md]
My Blog Content

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />
```

My Blog Content

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />

## Debug Component

### `<ValaxyDebug />`

Valaxy has a built-in `<ValaxyDebug />` debug panel component that is **only available in development mode** (completely removed in production builds, zero overhead).

This component displays a collapsible floating panel in the bottom-left corner of the page, providing the following debug information:

- **Breakpoints**: Currently active responsive breakpoints (xs / sm / md / lg / xl / 2xl)
- **Route**: Current route information (path, name, layout, query, params)
- **Frontmatter**: Current page frontmatter data (JSON format)
- **Config**: Site configuration summary and theme configuration

#### Usage

Use it directly in your theme or layout (no import needed, it's globally registered):

```vue
<template>
  <div>
    <!-- your page content -->
    <ValaxyDebug />
  </div>
</template>
```

::: tip
`<ValaxyDebug />` is loaded asynchronously via `defineAsyncComponent` and guarded by `import.meta.env.DEV`, so it **has zero impact on production bundle size**.
:::

## Custom


For more usage, please refer to [Custom Components](/guide/custom/components).

