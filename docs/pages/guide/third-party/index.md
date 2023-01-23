---
title: Third Party
title_zh-CN: 第三方集成
categories:
  - Third
end: false
top: 99
---

## 搜索

### 本地搜索（基于 fuse.js）

Valaxy 内置了基于 [fuse.js](https://fusejs.io/) 的离线搜索（须预先通过 `valaxy fuse` 构建生成本地缓存）。

> `valaxy fuse` 默认将 `fuse` 生成在 `dist` 目录下，如果你想在本地预览效果，你可以将 `dist/fuse-list.json` 拷贝至 `public/` 文件夹下。

#### 使用

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

```json {7,10}
{
  "name": "yun-demo",
  "valaxy": {
    "theme": "yun"
  },
  "scripts": {
    "build": "npm run build:ssg && npm run rss && npm run fuse",
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

### Algolia 搜索

Algolia 是一个在线第三方搜索服务，您需要自行申请相关 ID 和 Secret。

> [DocSearch](https://docsearch.algolia.com/) 申请通常只接受技术文档。

Valaxy 提供了一个快速集成插件 [valaxy-addon-algolia](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia)（目前仅支持 DocSearch）。

## 音乐播放器

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

