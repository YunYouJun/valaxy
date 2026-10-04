---
title: 文章
categories:
  - guide
end: false
---

> [Post VS Page](https://wordpress.com/zh-cn/support/post-vs-page/)

## FrontMatter {#frontmatter}

::: tip

更多配置项可参见：

- 文章（Post）配置：[PostFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/post.ts) （文章配置包含页面配置）
- 页面（Page）配置：[PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts) （可参见[页面配置 | Valaxy](/zh/guide/page)）



::: details PostFrontmatter Types

<<< @/../packages/valaxy/types/frontmatter/post.ts#snippet{ts:line-numbers}

:::

**文章**（`post`）继承自**页面**（`page`），因此**页面**中的 Front Matter 通用被**文章**支持。

> 单篇文章支持的配置项。

譬如：


```md
---
title: Title
hide: true
---
```


- `title`: 文章标题
- `hide`: 你可以在文章头部添加 hide 属性，来临时隐藏某篇文章。（该文章仍然会被渲染）
  - `true` / `all`: 当设置为 `true` 或 `all` 时，该文章仍然会被渲染，你可以直接访问链接进行查看。但不会被显示在展示的文章卡片与归档中。
  - `index`: 设置为 `index` 时，将只在首页隐藏，归档中仍然展示。（譬如放一些没有必要放在首页的笔记，并在归档中方便自己查看。）


## 图片与 Vue 组件封面 {#cover}

Yun 的文章卡片和文章头部都支持图片封面与可交互的 Vue 组件封面。**组件封面不需要图片**，可以完全使用内联 SVG、CSS 或 Canvas 绘制。

### 用 Vue 与 SVG 绘制封面 {#vue-svg-cover}

下面的天空、云层、轨道和星座全部由内联 SVG 绘制。点击按钮会连起星座并启动动画，再次点击暂停。不使用生成图片、图片地址或额外动画依赖。

<HelloValaxyCover subtitle="让文字，连成新的星座。" export-label="导出 PNG 分享图" />

1. 在博客中创建 `components/covers/HelloValaxyCover.vue`。默认博客脚手架已包含该组件；已有博客可复制下面的完整代码。
2. 在文章 Front Matter 中指定组件即可，`cover` 图片可省略：

```yaml
---
title: Hello, Valaxy!
coverComponent: HelloValaxyCover
coverProps:
  subtitle: 让文字，连成新的星座。
---
```

::: details 完整 Vue + SVG 组件代码

<<< @/../packages/create-valaxy/template-blog/components/covers/HelloValaxyCover.vue

:::

- `coverComponent` 是文件名对应的 PascalCase 组件名，不是文件路径或模板字符串。
- `coverProps` 只使用可序列化的值，例如字符串、数字、布尔值、数组和普通对象。
- 容器传入 `context`（卡片为 `card`，文章头部为 `page`）和可选的 `src`（原始 `cover` 地址）。这两个保留属性优先于 `coverProps` 中的同名值；纯图形组件可以忽略 `src`。
- 组件按需加载，并参与静态生成。JavaScript 启动前已有 SVG 画面，水合后即可交互。
- 卡片中的组件区域可以独立交互；标题及卡片其他区域仍可打开文章。

也支持 `src/components/covers/`，以及主题和插件的 `components/covers/`。同名组件遵循正常的根目录覆盖顺序；同一目录树内的文件应使用唯一组件名。

### 正文中复用组件 {#cover-in-markdown}

正文可以直接使用同一个组件，并传入独立的属性：

```md
<HelloValaxyCover subtitle="在正文中，也能点亮星空。" />
```

示例组件直接使用时默认 `context="body"`，卡片、文章头部和正文实例各自保存开关状态。Yun 已接入组件封面；其他主题可以使用核心的 `<ValaxyCover :src="cover" :component="coverComponent" :component-props="coverProps" />` 接入。正文 Vue 组件的支持不受主题限制，更多见 [在 Markdown 中使用 Vue](/zh/guide/markdown#using-vue-in-markdown)。

### 动画与渲染 {#cover-animation}

示例通过 Vue 状态与 CSS 过渡、关键帧驱动 SVG，无需额外动画库。点击后开始动画，移出视口或切换到后台标签页时暂停；系统开启减少动态效果时保留开关功能，并停用运动和过渡。

SVG 渐变、遮罩等 ID 使用 `useId()`，避免同一页面多个实例相互影响。初始坐标应保持确定，不要在 setup 中调用 `Math.random()` 或读取 `window`。`IntersectionObserver` 等浏览器 API 放在 `onMounted` 中，并在卸载时清理。需要 DOM 的 Canvas/WebGL 库可以放在 `<ClientOnly>` 中，并提供 SVG 静态回退。

Motion 是可选项。Yun 已提供 `@vueuse/motion`；也可以在博客中执行 `pnpm add motion-v`，使用它的 `<motion.path>` 和 SVG 描边动画。这是两个不同的库，API 不能混用。参见 [Motion for Vue：SVG 描边动画](https://motion.dev/docs/vue-animation#svg-line-drawing)。在封面组件内导入动画库，并保留可见性、减少动态效果和 SSR 处理即可。

### 可选图片与分享预览 {#cover-image}

纯图片封面仍使用 `cover: /images/my-cover.jpg`。使用组件封面时，`cover` 可以提供组件缺失或运行失败后的图片回退；未设置时就没有图片回退。分享图片可以通过独立的 `ogImage` 指定：

```yaml
coverComponent: HelloValaxyCover
# 两项都可省略；需要时使用自己的图片文件。
# cover: /images/cover-fallback.jpg
# ogImage: /images/share-preview.png
```

Valaxy 不会在构建时自动截图 Vue 组件。你可以用下方的导出功能保存静态分享图。分享预览按 `ogImage`、`cover`、正文首图、站点 favicon 的顺序取值。SVG 组件封面的显示不依赖这两个图片字段。需要加载图片的组件可以用 `withBase(src)` 适配子路径部署。

### 从同一份 SVG 导出分享图 {#cover-export}

点击上方示例的「导出 PNG 分享图」即可下载 **1200 × 630** 的 PNG。背景、星座、云层和文字都来自正在展示的 SVG，CSS 动画会定格为导出时的画面；HTML 按钮不进入图片，也不会改变当前开关状态。

将下载的 `hello-valaxy-og.png` 放入博客的 `public/images/`，然后设置：

```yaml
ogImage: /images/hello-valaxy-og.png
```

修改组件或文案后重新导出即可。无需生图服务、上传或额外构建依赖。

自定义导出入口可以使用 `<ValaxySvgExport>`，传入已挂载的 SVG 元素。示例封面通过 `defineExpose({ svg })` 暴露它：

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const cover = useTemplateRef<{ svg: SVGSVGElement | null }>('cover')
</script>

<template>
  <HelloValaxyCover ref="cover" />
  <ValaxySvgExport :svg="cover?.svg" filename="hello-valaxy-og.png" label="导出 PNG 分享图" />
</template>
```

也可以 `import { svgToPng } from 'valaxy'`，调用 `await svgToPng(svg, { width: 1200, height: 630 })` 获取 PNG Blob，自行处理保存。尺寸变化遵循 SVG 的 `viewBox` 和 `preserveAspectRatio`；本例会略微裁切上下边缘。

导出针对自包含 SVG：图片资源需内嵌为 data URL，文字建议使用系统字体；不支持 HTML/`foreignObject`、SMIL 动画，也不会自动嵌入外部字体。请在浏览器挂载后触发导出，不能在 SSR setup 中调用。

### 排查组件封面 {#cover-diagnostics}

开发模式下，组件名不存在会在封面区域和控制台提示检查 `components/covers/` 中的文件名；组件加载或渲染失败会显示组件名，并在控制台保留原始错误。设置了 `cover` 时仍保留图片回退。生产环境不展示这些开发提示。

## 摘要 {#excerpt}


你可以通过插入 `<!-- more -->` 的方式生成摘要（excerpt）。
可通过设置 `excerpt_type` 设置摘要渲染类型。

- `excerpt`: 自定义摘要（优先级高于 `<!-- more -->`）
- `excerpt_type`: 预览列表**摘要**的渲染类型（与 `<!-- more -->` 配合使用）
  - `md`: 展示原始 Markdown
  - `html`: 以 HTML 形式展示
  - `text`: 以纯文本形式展示（去除 HTML 标签）



::: code-group

```md{3,10} [excerpt_type: text]
---
title: 'excerpt_type: text'
excerpt_type: text
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

<!-- more -->

Main Content
```

```md{3,10} [excerpt_type: md]
---
title: 'excerpt_type: md'
excerpt_type: md
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

<!-- more -->

Main Content
```

```md{3,10} [excerpt_type: html]
---
title: 'excerpt_type: html'
excerpt_type: html
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

<!-- more -->

Main Content
```

```md{3} [custom excerpt]
---
title: 'custom excerpt'
excerpt: This is a custom excerpt.
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

Main Content
```

:::

You will get excerpt:

::: code-group

```md [excerpt_type: text]
HEADER yun-bg
```

```md [excerpt_type: md]
## Header ![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)
```

```md [excerpt_type: html]
<!-- Rendered HTML -->
```

```md [custom excerpt]
This is a custom excerpt.
```

:::

## 插入 {#insert}


### 组件 {#components}



- 如想在文章中插入现有公共组件，请参照 [组件](/zh/guide/built-ins)。
- 如想在文章中插入自定义组件，请参照 [自定义组件](/zh/guide/custom/components)。



### 脚本 {#scripts}



可直接通过 [`useScriptTag`](https://vueuse.org/core/useScriptTag/) 使用，封装为组件或直接添加在文章中。



```vue
<script lang="ts" setup>
useScriptTag('https://static.codepen.io/assets/embed/ei.js')
</script>
```

## 强制规范 {#force-standard}



由于 Valaxy 支持解析 Vue 组件渲染，因此当您输入 `<CustomComponent></CustomComponent>` 时，它会解析 `components` 目录下的 `CustomComponent.vue` 组件并渲染。

当您不需要其被渲染时，请务必使用反引号包裹，如：



```md
`<CustomComponent></CustomComponent>`
```
