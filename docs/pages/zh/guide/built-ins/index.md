---
title: 组件
categories:
  - guide
end: false
---

Valaxy 内置了几个简单的组件。

你可以在写文章或者创作主题时直接使用。



::: tip

<div flex items="center" pb-1><div inline-flex i-logos:vue /> <span ml-1 inline-flex>基于 Vue 组件</span></div>

:::



## 基础组件 {#basic-components}



::: info
面向主题开发者（普通用户通常不需要直接使用）
:::



### 布局与渲染 {#layout-and-rendering}


- [`ValaxyMain.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMain.vue): 页面基础布局
- [`ValaxyMd.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMd.vue): Markdown 渲染内容




### 其他 {#others}


- [`AppLink.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/AppLink.vue): 根据链接自动判断是否为站内链接，站内链接使用 `<router-link/>`，站外链接使用 `<a target="_blank"></a>`。
- [`ValaxyCopyright.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyCopyright.vue): 文章中的版权信息
- [`ValaxyDecrypt.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyDecrypt.vue): 文本解密组件
- [`ValaxyGalleryDecrypt.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyGalleryDecrypt.vue): 图片解密组件
- [`ValaxyLogo.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyLogo.vue): 带渐变色彩的 Valaxy Logo
- [`ValaxySvgLogo.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxySvgLogo.vue>): Valaxy SVG Logo
- [`ValaxyPagination.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyPagination.vue>): 分页组件
- [`ValaxyOverlay.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyOverlay.vue>): 灰色遮罩组件
- [`ValaxyHamburger.vue`](<https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyHamburger.vue>): 汉堡按钮



```md
<ValaxyLogo />
```

<ValaxyLogo />

## 辅助组件 {#helper-components}


### 内置组件 {#内置组件}


> 面向用户，可直接使用

你也可以通过 [valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components) 扩展公共组件。



#### 国际化组件 `<VT />` {#internationalization-component}

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

### 扩展公共组件 {#扩展公共组件}

```bash [pnpm]
pnpm add valaxy-addon-components
```

如：


- `CodePen`: CodePen 代码片段
- `VCLiveTime`: 站点建立时间



```md [pages/posts/your-post.md]
My Blog Content

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />
```

My Blog Content

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />

## 调试组件 {#debug-component}

### `<ValaxyDebug />` {#valaxy-debug}

Valaxy 内置了 `<ValaxyDebug />` 调试面板组件，**仅在开发模式下可用**（生产构建时会被完全移除，零开销）。

该组件会在页面左下角显示一个可折叠的浮动面板，包含以下调试信息：

- **Breakpoints**：当前视口命中的响应式断点（xs / sm / md / lg / xl / 2xl）
- **Route**：当前路由信息（path、name、layout、query、params）
- **Frontmatter**：当前页面的 frontmatter 数据（JSON 格式）
- **Config**：站点配置摘要和主题配置

#### 使用方式 {#debug-usage}

在你的主题或布局中直接使用即可（无需引入，已全局注册）：

```vue
<template>
  <div>
    <!-- 你的页面内容 -->
    <ValaxyDebug />
  </div>
</template>
```

::: tip
`<ValaxyDebug />` 使用 `defineAsyncComponent` 异步加载，并通过 `import.meta.env.DEV` 守卫注册，因此**不会影响生产环境的打包体积**。
:::

## 自定义 {#自定义}


更多用法请参见 [自定义组件](/zh/guide/custom/components)。



