---
title: Custom Extensions
categories:
  - custom
end: false
---


Valaxy provides strong extensibility by "Convension over Configuration". If you have some development experience, you should be able to control every detail in the website.


> The following content applies to either users or theme developers.

::: tip
By default, the operations are done in the root directory of the site or the theme.

If you want some reference, you can refer to [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun).
:::


## Automatic Layout Registration


Valaxy provides custom layouts based on [vite-plugin-vue-layouts-next](https://github.com/loicduong/vite-plugin-vue-layouts-next).

Create a `layouts` file, and write Vue components as layouts.

You can use it in your Markdown as follows.

```md [pages/album.md]
---
title: Photos
layout: album
---
```


Likewise, when there are layouts with the same name, the order to use is `user directory` -> `theme directory` -> `Valaxy directory`.


## Customizing index.html


Create a new `index.html` file. You can globally insert anything in between `<head></head>` or `<body></body>` tags.

For example:

```html [index.html]
<head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/star-markdown-css/dist/planet/planet-markdown.min.css"
  />
</head>
```


## Extending Client Context


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


## I18n


Create `locales` folder.

- `zh-CN.yml`: Chinese translation
- `en.yml`: English translation

For example (make sure that the file is not empty):

```yaml [locales/en.yml]
button:
  about: About
```

```yaml [locales/zh-CN.yml]
button:
  about: 关于
```


You can use it like this:

```vue [components/CustomButton.vue]
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


## Template Files


Create some templates for Markdown layout. (Work in progress)

Create `scaffolds` folder.

```bash
valaxy new <title> -l [layout]
```


- `layout`: Default is `post`

Create a new file `xxx.md`, where `xxx` is your layout name.
For example, `album.md` represents `layout: album`.

```bash
valaxy new my-young -l album
```


## Others


- [Custom Styles | Valaxy](/guide/custom/styles)

