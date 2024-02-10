---
title: Components
title_zh: 组件
categories:
  - guide
end: false
---

::: zh-CN
Valaxy 内置了几个简单的组件。

你可以在写文章或者创作主题时直接使用。
:::

::: en
Valaxy has several simple components built in.

You can use them directly when writing articles or themes.
:::

::: tip <div flex items="center" pb-1><div inline-flex i-logos:vue /> <span ml-1 inline-flex>基于 Vue 组件</span></div>
:::

## 基础组件 {lang="zh-CN"}

## Basic Components {lang="en"}

::: info
面向主题开发者（普通用户通常不需要直接使用）
:::

::: zh-CN

### 布局与渲染

- [`ValaxyMain.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMain.vue): 页面基础布局
- [`ValaxyMd.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMd.vue): Markdown 渲染内容
:::

::: en
> For theme developers, common users usually don't need to use them directly.

### Layout and Rendering

- [`ValaxyMain.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMain.vue): Basic page layout
- [`ValaxyMd.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyMd.vue): Rendered Markdown content
:::

### 其他

- [`AppLink.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyCopyright.vue): 根据链接
  自动判断是否为站内链接，站内链接使用 `<router-link/>`，站外链接使用 `<a target="_blank"></a>`。
- [`ValaxyCopyright.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/client/components/ValaxyCopyright.vue): 文章中的
  版权信息
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

## 辅助组件 {lang="zh-CN"}

## Helper Components {lang="en"}

::: zh-CN
> 面向用户，可直接使用

:::

::: en
> For users, can be used directly.

:::

内置组件暂无，目前通过 [valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components) 扩展公共组件。

```bash
pnpm add valaxy-addon-components
```

如：

- `CodePen`: CodePen 代码片段
- `VCLiveTime`: 站点建立时间

```md
My Blog Content

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />
```

My Blog Content

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />

## 自定义

更多用法请参见 [自定义组件](/guide/custom/components)。
