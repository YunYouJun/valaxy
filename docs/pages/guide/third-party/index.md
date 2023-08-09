---
title: Third Party
title_zh-CN: 第三方集成
categories:
  - Third
end: false
top: 99
---

## 搜索 {lang="zh-CN"}

## Search {lang="en"}

### 本地搜索（基于 fuse.js） {lang="zh-CN"}

### Local Search (Based on fuse.js) {lang="en"}

::: zh-CN
Valaxy 内置了基于 [fuse.js](https://fusejs.io/) 的离线搜索（须预先通过 `valaxy fuse` 构建生成本地缓存）。

> `valaxy fuse` 默认将 `fuse` 生成在 `public` 目录下，并在 `.gitignore` 中添加 `public/valaxy-fuse-list.json` 忽略。
> 请在 `valaxy build` 之前使用 `valaxy fuse` 构建。

如果你想要使用全文搜索，可参考 [Options | fuse.js](https://www.fusejs.io/api/options.html) 进行设置。
譬如：

```ts
export default defineSiteConfig({
  search: {
    enable: true,
    type: 'fuse',
  },
  fuse: {
    options: {
      keys: ['title', 'tags', 'categories', 'excerpt', 'content'],
      /**
       * @default 0.6
       * @see https://www.fusejs.io/api/options.html#threshold
       * 设置匹配阈值，越低越精确
       */
      // threshold: 0.6,
      /**
       * @default false
       * @see https://www.fusejs.io/api/options.html#ignoreLocation
       * 忽略位置
       * 这对于搜索文档全文内容有用，若无需全文搜索，则无需设置此项
       */
      ignoreLocation: true,
    },
  },
})
```

:::

::: en
Valaxy has built-in local search based on [fuse.js](https://fusejs.io/). The local cache should be generated in advance via `valaxy fuse`.

> `valaxy fuse` generates `fuse` in the `public` directory by default.
> Please use `valaxy fuse` before `valaxy build`.
:::

#### 使用 {lang="zh-CN"}

#### Setup {lang="en"}

::: zh-CN

```ts
// site.config.ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  search: {
    enable: true,
    // 设置类型为 Fuse
    type: 'fuse',
  },
})
```

- 在你的 `package.json` 中添加 fuse 生成脚本
:::

::: en

```ts {7}
// site.config.ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  search: {
    enable: true,
    // Set type to 'fuse'
    type: 'fuse',
  },
})
```

- Add fuse generation script in your `package.json`
:::

```json {7,9}
{
  "name": "yun-demo",
  "valaxy": {
    "theme": "yun"
  },
  "scripts": {
    "build": "npm run fuse && npm run build:ssg && npm run rss",
    "build:ssg": "valaxy build --ssg",
    "fuse": "valaxy fuse",
    "rss": "valaxy rss"
  },
  "dependencies": {
    "valaxy": "latest",
    "valaxy-theme-yun": "latest"
  }
}
```

### Algolia 搜索 {lang="zh-CN"}

### Algolia DocSearch {lang="en"}

::: zh-CN
Algolia 是一个在线第三方搜索服务，您需要自行申请相关 ID 和 Secret。

> [DocSearch](https://docsearch.algolia.com/) 申请通常只接受技术文档。

Valaxy 提供了一个快速集成插件 [valaxy-addon-algolia](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia)（目前仅支持 DocSearch）。
:::

::: en
Algolia is an online third-party search service. You need to apply for the `ID` and `Secret` by yourself.

> [DocSearch](https://docsearch.algolia.com/) Only technical document applications are accepted generally.

Valaxy provides a quick integration plug-in: [valaxy-addon-algolia](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia) (Currently only DocSearch is supported).
:::

## 图片预览（Medium Zoom） {lang="zh-CN"}

## Image Preview (Medium Zoom) {lang="en"}

::: zh-CN
Valaxy 内置了 [medium-zoom](https://github.com/francoischalifour/medium-zoom) 进行图片预览，默认关闭。

> [Medium Zoom Demo](https://medium-zoom.francoischalifour.com/)

- mediumZoom
  - `enable`: 是否开启
  - `selector`: 可自定义传入选择器
  - `options`: 与 [options | medium-zoom](https://github.com/francoischalifour/medium-zoom#options) 一致

譬如开启 Medium Zoom：
:::

::: en
Valaxy has built-in [medium-zoom](https://github.com/francoischalifour/medium-zoom) to preview the pictures, which is disabled by default.

> [Medium Zoom Demo](https://medium-zoom.francoischalifour.com/)

- mediumZoom
  - `enable`: Set to true to enable it
  - `selector`: Custom CSS selector
  - `options`: Refer to [options | medium-zoom](https://github.com/francoischalifour/medium-zoom#options)
:::

```ts
// site.config.ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  mediumZoom: { enable: true }
})
```

::: zh-CN
除此之外，你也可以单独控制是否在某篇文章中开启。
:::

::: en
In addition, you can also enable it in a certain article independently.
:::

```md
---
title: Test Medium Zoom
medium_zoom: true
---
```

## 音乐播放器 {lang="zh-CN"}

## Music Player {lang="en"}

::: zh-CN
> 基于 [Aplayer](https://github.com/DIYgod/APlayer) 与 [MetingJS](https://github.com/metowolf/MetingJS) 实现

譬如在文章中引入网易云某首歌曲（ID 为歌曲 ID）：

在文章头部添加：
:::

::: en
> Implementd based on [Aplayer](https://github.com/DIYgod/APlayer) and [MetingJS](https://github.com/metowolf/MetingJS)

For example, add a song from Netease Cloud in a article:

Enable it in the FrontMatter of the article:
:::

```md
---
aplayer: true
---
```

::: zh-CN
在文中引入：
:::

::: en
Add the component to the article:
:::

```html
<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>
```

::: zh-CN
效果如下：
:::

::: en
Here is a demo:
:::

<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>

> More info see [Option | MetingJS](https://github.com/metowolf/MetingJS#option)

## 谷歌统计 {lang="zh-CN"}

## Google Statistics {lang="en"}

::: zh-CN
> 可参见 [扩展 Client 上下文｜自定义扩展](/guide/custom/extend#%25E6%2589%25A9%25E5%25B1%2595-client-%25E4%25B8%258A%25E4%25B8%258B%25E6%2596%2587)

你可以通过直接使用 Vue 插件的方式引入谷歌统计。

譬如：

- 安装依赖：`pnpm add vue-gtag-next`
- 新建 `setup/main.ts`:

```ts
// setup/main.ts
import { defineAppSetup } from 'valaxy'
import { install as installGtag } from './gtag'

export default defineAppSetup((ctx) => {
  installGtag(ctx)
})
```

- 新建 `setup/gtag.ts`:

```ts
import VueGtag, { trackRouter } from 'vue-gtag-next'
import type { UserModule } from 'valaxy'

export const install: UserModule = ({ isClient, app, router }) => {
  if (isClient) {
    app.use(VueGtag, {
      property: { id: 'G-1LL0D86CY9' },
    })

    trackRouter(router)
  }
}
```
:::

::: en
> Refer to [Custom Extensions | Extending Client Context](/guide/custom/extend#extending-client-context)

You can add Google Statistics by using Vue plug-in directly.

For example:

- Install the dependency: `pnpm add vue-gtag-next`
- Create `setup/main.ts`

```ts
// setup/main.ts
import { defineAppSetup } from 'valaxy'
import { install as installGtag } from './gtag'

export default defineAppSetup((ctx) => {
  installGtag(ctx)
})
```

- Create `setup/gtag.ts`

```ts
import VueGtag, { trackRouter } from 'vue-gtag-next'
import type { UserModule } from 'valaxy'

export const install: UserModule = ({ isClient, app, router }) => {
  if (isClient) {
    app.use(VueGtag, {
      property: { id: 'G-1LL0D86CY9' },
    })

    trackRouter(router)
  }
}
```
:::

More info see [vue-gtag-next](https://github.com/MatteoGabriele/vue-gtag-next).
