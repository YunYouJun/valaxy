---
title: Post
categories:
  - guide
end: false
---

> [Post VS Page](https://wordpress.com/zh-cn/support/post-vs-page/)

## FrontMatter

::: tip


More configuration options can be found in:

- Post configuration: [PostFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/post.ts) (Post configuration extends page configuration)
- Page configuration: [PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts) (See [Page | Valaxy](/guide/page))


::: details PostFrontmatter Types

<<< @/../packages/valaxy/types/frontmatter/post.ts#snippet{ts:line-numbers}

:::


`post` is a descendant of `page`, so the front matter in **pages** are supported by **posts**.

For example:

```md
---
title: Title
hide: true
---
```


- `title`: Title of the article.
- `hide`: Adding `hide` in the header allows you to hide the article temporarily. (The article will still be rendered)
  - `true` / `all`: When set to `true` or `all`, the article will be rendered, and you can view it by visiting the link directly. It will not be displayed in article cards or archives.
  - `index`: When set to `index`, it will be hidden only in the front page. It will still be displayed in archives. (You can use this for some notes unnecessary for the front page, but good for the archive for reference sometimes)


## Image and Vue Component Covers {#cover}

Yun supports both image covers and interactive Vue covers in post cards and article headers. **A component cover does not require an image.** It can draw its entire scene with inline SVG, CSS or Canvas.

### A cover drawn with Vue and SVG {#vue-svg-cover}

This example draws the sky, clouds, orbits and constellation with inline SVG. Click the button to draw the constellation and start the motion; click again to pause. No generated image, image URL or animation dependency is used.

<HelloValaxyCover />

1. Create `components/covers/HelloValaxyCover.vue` in your blog. The default blog scaffold already includes it. Copy the complete component below to use it in an existing blog.
2. Select the component in a post's frontmatter. `cover` is optional:

```yaml
---
title: Hello, Valaxy!
coverComponent: HelloValaxyCover
coverProps:
  subtitle: Your words, a new constellation.
---
```

::: details Complete Vue + SVG component

<<< @/../packages/create-valaxy/template-blog/components/covers/HelloValaxyCover.vue

:::

- `coverComponent` is the PascalCase component name derived from its filename, not a path or template string.
- Use only serializable values in `coverProps`: strings, numbers, booleans, arrays and plain objects.
- The container supplies `context` (`card` or `page`) and optional `src` (the original `cover` URL). These reserved props override values in `coverProps`. A purely graphical component can ignore `src`.
- Components load on demand and participate in static generation. The SVG remains visible before JavaScript starts; interaction starts after hydration.
- A component cover owns its interactive area. The title and the rest of the post card still open the article.

Components can also live in `src/components/covers/` or a theme/addon's `components/covers/`. Matching names follow the normal root override order. Use unique filenames within each cover directory tree.

### Reuse the component in Markdown {#cover-in-markdown}

Markdown supports the same component with independent props and state:

```md
<HelloValaxyCover subtitle="The same component, inside your story." />
```

The example defaults to `context="body"` when used directly. Each card, header and body instance keeps its own toggle state. Yun integrates component covers; other themes can use the core `<ValaxyCover :src="cover" :component="coverComponent" :component-props="coverProps" />` renderer. Vue components in article content work across themes; see [Using Vue in Markdown](/guide/markdown#using-vue-in-markdown).

### Animation and rendering {#cover-animation}

The example uses Vue state and CSS transitions/keyframes to animate SVG. It needs only Vue. Its animation starts on click, pauses outside the viewport or in a hidden tab, and respects `prefers-reduced-motion` while keeping the toggle functional.

Use `useId()` for SVG gradient/mask IDs so several instances can appear on one page. Keep initial coordinates deterministic; do not call `Math.random()` or read `window` during setup. Put browser APIs such as `IntersectionObserver` in `onMounted`, and disconnect them on unmount. Canvas/WebGL libraries that need the DOM can be wrapped in `<ClientOnly>` with an SVG fallback.

Motion is optional. Yun already provides `@vueuse/motion`; alternatively, install `motion-v` in your blog (`pnpm add motion-v`) for its `<motion.path>` API and SVG path drawing. These are separate libraries; their APIs are not interchangeable. See [Motion for Vue: SVG line drawing](https://motion.dev/docs/vue-animation#svg-line-drawing). Import the library in your cover component, and preserve the same visibility, reduced-motion and SSR behavior.

### Optional images and social previews {#cover-image}

For an image-only cover, use `cover: /images/my-cover.jpg`. For a component cover, the same optional field supplies an image fallback if the component is missing or fails. Without it, there is no image fallback. A separate `ogImage` can be provided for social sharing:

```yaml
coverComponent: HelloValaxyCover
# Both are optional; use your own image files if needed.
# cover: /images/cover-fallback.jpg
# ogImage: /images/share-preview.png
```

Valaxy does not automatically capture Vue components during a build. Use the export below to save a static social image. Social previews use `ogImage`, then `cover`, then the first article image or the site's favicon. Neither image field is required to render the SVG cover. Image-based components can use `withBase(src)` for subpath deployments.

### Export a social image from the same SVG {#cover-export}

Click **Export PNG** below the live example to download a **1200 × 630** PNG. The sky, constellation, clouds and text come from the displayed SVG. CSS animation is frozen at its current frame; HTML buttons are excluded and the toggle state stays unchanged.

Place the downloaded `hello-valaxy-og.png` in your blog's `public/images/` directory and set:

```yaml
ogImage: /images/hello-valaxy-og.png
```

Export again after changing the component or its text. No image generation service, upload or additional build dependency is needed.

To add your own export control, pass a mounted SVG element to `<ValaxySvgExport>`. The example cover exposes it with `defineExpose({ svg })`:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const cover = useTemplateRef<{ svg: SVGSVGElement | null }>('cover')
</script>

<template>
  <HelloValaxyCover ref="cover" />
  <ValaxySvgExport :svg="cover?.svg" filename="hello-valaxy-og.png" />
</template>
```

Alternatively, `import { svgToPng } from 'valaxy'` and call `await svgToPng(svg, { width: 1200, height: 630 })` to get a PNG Blob for your own download flow. Resizing follows the SVG's `viewBox` and `preserveAspectRatio`; this example slightly crops the top and bottom edges.

Export supports self-contained SVG. Embed image resources as data URLs and prefer system fonts. HTML/`foreignObject`, SMIL animation and automatic external font embedding are unsupported. Trigger export after mounting in a browser, never during SSR setup.

### Troubleshooting component covers {#cover-diagnostics}

In development, unknown component names show a hint in the cover area and console pointing to `components/covers/`. Loading or rendering failures identify the component and retain the original error in the console. An optional image `cover` remains as a fallback. These developer diagnostics are hidden in production.

## Excerpt


You can insert `<!--more-->` to generate an excerpt.
You can set the excerpt rendering type by setting `excerpt_type`.

- `excerpt`: Custom excerpt (higher priority than `<!-- more -->`)
- `excerpt_type`: The rendering type for the excerpt in the preview list (Used with `<!-- more -->`)
  - `md`: Display as original markdown
  - `html`: Display as HTML
  - `text`: Display as text (removing HTML tags)


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


## Insert


### Components


- To insert existing public components in the article, please refer to [Components](/guide/built-ins).
- To insert custom components in the article, please refer to [Custom Components](/guide/custom/components).


### Scripts


You can use [`useScriptTag`](https://vueuse.org/core/useScriptTag/) directly, encapsulate it as a component, or add it directly to the article.


```vue
<script lang="ts" setup>
useScriptTag('https://static.codepen.io/assets/embed/ei.js')
</script>
```


## Force Standard


Since Valaxy supports parsing Vue component rendering, when you enter `<CustomComponent></CustomComponent>`, it will parse the `CustomComponent.vue` component in the `components` directory and render it.

When you don't want it to be rendered, be sure to wrap it in backticks, like:


```md
`<CustomComponent></CustomComponent>`
```
