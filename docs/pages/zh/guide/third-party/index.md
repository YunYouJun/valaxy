---
title: 第三方集成
categories:
  - third
end: false
top: 99
aplayer: true
---

## 搜索 {#search}


### 本地搜索（基于 fuse.js） {#local-search-based-on-fusejs}


Valaxy 内置了基于 [fuse.js](https://fusejs.io/) 的离线搜索（须预先通过 `valaxy fuse` 构建生成本地缓存）。

> `valaxy fuse` 默认将 `fuse` 生成在 `public` 目录下，并在 `.gitignore` 中添加 `public/valaxy-fuse-list.json` 忽略。
> 在执行 `valaxy build` 之前，会自动执行 `valaxy fuse`。

如果你想要使用全文搜索，可参考 [Options | fuse.js](https://www.fusejs.io/api/options.html) 进行设置。
譬如：

```ts [site.config.ts]
export default defineSiteConfig({
  search: {
    enable: true,
    type: 'fuse',
  },
  fuse: {
    /**
     * 设置搜索的文件路径
     */
    // pattern: 'pages/**/*.md',
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



#### 使用 {#setup}



```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  search: {
    enable: true,
    // 设置类型为 Fuse
    provider: 'fuse',
  },
})
```

- 在你的 `package.json` 中添加 fuse 生成脚本


```json {7,9} [package.json]
{
  "name": "yun-demo",
  "valaxy": {
    "theme": "yun"
  },
  "scripts": {
    "build": "npm run build:ssg",
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

### Algolia 搜索 {#algolia-docsearch}


Algolia 是一个在线第三方搜索服务，您需要自行申请相关 ID 和 Secret。

> [DocSearch](https://docsearch.algolia.com/) 申请通常只接受技术文档。

Valaxy 提供了一个快速集成插件 [valaxy-addon-algolia](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia)（目前仅支持 DocSearch）。


## 音乐播放器 {#music-player}


> 基于 [Aplayer](https://github.com/DIYgod/APlayer) 与 [MetingJS](https://github.com/metowolf/MetingJS) 实现

譬如在文章中引入网易云某首歌曲（ID 为歌曲 ID）：

在文章头部添加：


```md
---
aplayer: true
---
```

在文中引入：


```html
<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>
```

效果如下：


<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>

> More info see [Option | MetingJS](https://github.com/metowolf/MetingJS#option)

## 谷歌统计 {#google-statistics}


> 可参见 [扩展 Client 上下文｜自定义扩展](/zh/guide/custom/extend#%25E6%2589%25A9%25E5%25B1%2595-client-%25E4%25B8%258A%25E4%25B8%258B%25E6%2596%2587)

你可以通过直接使用 Vue 插件的方式引入谷歌统计。

譬如：

- 安装依赖：`pnpm add vue-gtag-next`
- 新建 `setup/main.ts`:

```ts [setup/main.ts]
import { defineAppSetup } from 'valaxy'
import { install as installGtag } from './gtag'

export default defineAppSetup((ctx) => {
  installGtag(ctx)
})
```

- 新建 `setup/gtag.ts`:

```ts [setup/gtag.ts]
import type { UserModule } from 'valaxy'
import VueGtag, { trackRouter } from 'vue-gtag-next'

export const install: UserModule = ({ isClient, app, router }) => {
  if (isClient) {
    app.use(VueGtag, {
      property: { id: 'G-1LL0D86CY9' },
    })

    trackRouter(router)
  }
}
```



More info see [vue-gtag-next](https://github.com/MatteoGabriele/vue-gtag-next).

