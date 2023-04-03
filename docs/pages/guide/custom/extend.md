---
title: Custom Extensions
title_zh-CN: 自定义扩展
categories:
  - Custom
end: false
---

::: zh-CN
Valaxy 以约定大于配置的方式提供了强大的扩展功能，如果你有一定开发经验，可以自定义控制站点的每一处细节。
:::

::: en
Valaxy provides strong extensibility by "Convension over Configuration". If you have some development experience, you should be able to control every detail in the website.
:::

<div lang="zh-CN">

> 以下内容无论对于用户还是主题开发者来说都同样适用。

::: tip
默认在用户站点根目录或主题根目录下操作。

如果你想要有所参考，你可以参见 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun)。
:::

</div>

<div lang="en">

> The following content applies to either users or theme developers.

::: tip
By default, the operations are done in the root directory of the site or the theme.

If you want some reference, you can refer to [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun).
:::

</div>

## 自动布局注册 {lang="zh-CN"}

## Automatic Layout Registration {lang="en"}

::: zh-CN
基于 [vite-plugin-vue-layouts](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)，Valaxy 提供了布局功能。

新建 `layouts` 文件，书写 Vue 组件作为布局。

你可以在 Markdown 中如下使用它。
:::

::: en
Valaxy provides custom layouts based on [vite-plugin-vue-layouts](https://github.com/JohnCampionJr/vite-plugin-vue-layouts).

Create a `layouts` file, and write Vue components as layouts.

You can use it in your Markdown as follows.
:::

```md
---
title: Photos
layout: album
---
```

::: zh-CN
同样，当存在同名布局时，覆盖顺序为 `用户目录` -> `主题目录` -> `Valaxy 客户端目录`。
:::

::: en
Likewise, when there are layouts with the same name, the order to use is `user directory` -> `theme directory` -> `Valaxy directory`.
:::

## 自定义 index.html {lang="zh-CN"}

## Customizing index.html {lang="en"}

::: zh-CN
新建 `index.html`，你可以在 `<head></head>` 与 `<body></body>` 全局地插入任意内容。

譬如：
:::

::: en
Create a new `index.html` file. You can globally insert anything in between `<head></head>` or `<body></body>` tags.

For example:
:::

```html
<head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/star-markdown-css/dist/planet/planet-markdown.min.css"
  />
</head>
```

## 扩展 Client 上下文 {lang="zh-CN"}

## Extending Client Context {lang="en"}

::: zh-CN
新建 `setup/main.ts`：

```ts
import { defineAppSetup } from 'valaxy'

export default defineAppSetup((ctx) => {
  console.log(ctx)
  const { app, head, router, routes, isClient } = ctx
  // 任意使用 Vue 生态的插件
  app.use(/* */)
})
```

> 具体示例可参见 [谷歌统计｜第三方集成](/guide/third-party/#谷歌统计)。
:::

::: en
Create a new file `setup/main.ts`:

```ts
import { defineAppSetup } from 'valaxy'

export default defineAppSetup((ctx) => {
  console.log(ctx)
  const { app, head, router, routes, isClient } = ctx
  // Use any Vue plugins
  app.use(/* */)
})
```

> For a detailed example, please see [Google Analytics | Third Party Integration](/guide/third-party/#谷歌统计)。
:::

## 多语言支持 {lang="zh-CN"}

## I18n {lang="en"}

::: zh-CN
新建 `locales` 文件夹。

- `zh-CN.yml`: 中文翻译
- `en.yml`: 英文翻译

譬如（请确保文件内容非空）：
:::

::: en
Create `locales` folder.

- `zh-CN.yml`: Chinese translation
- `en.yml`: English translation

For example (make sure that the file is not empty):
:::

```yaml
# en.yml
button:
  about: About
```

```yaml
# zh-CN.yml
button:
  about: 关于
```

::: zh-CN
你可以如下方式使用它：
:::

::: en
You can use it like this:
:::

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <button>
    {{ t('button.about') }}
  </button>
</template>
```

## 模版文件 {lang="zh-CN"}

## Template Files {lang="en"}

::: zh-CN
新建某类布局 Markdown 文件的模版。（开发中）

新建 `scaffolds` 文件夹。
:::

::: en
Create some templates for Markdown layout. (Work in progress)

Create `scaffolds` folder.
:::

```bash
valaxy new <title> -l [layout]
```

::: zh-CN

- `layout`: 默认为 `post`

新建 `xxx.md`，xxx 取决于你的布局名称。
譬如 `album.md` 代表 `layout: album`。
:::

::: en

- `layout`: Default is `post`

Create a new file `xxx.md`, where `xxx` is your layout name.
For example, `album.md` represents `layout: album`.
:::

```bash
valaxy new my-young -l album
```

## 其他 {lang="zh-CN"}

## Others {lang="en"}

::: zh-CN

- [自定义样式 | Valaxy](/guide/custom/styles)

:::

::: en

- [Custom Styles | Valaxy](/guide/custom/styles)

:::
