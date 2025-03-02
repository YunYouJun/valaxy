---
title: 主题配置
---

配置 `valaxy.config.ts` 中的 `themeConfig` 字段，类型可直接参考 [valaxy-theme-yun/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/types/index.d.ts)。

如您需要更详细的描述/示例，再阅读下方内容。

## 首页

### 标语动画

首页的垂直交错排列文字效果。默认开启。

- `enable`: 是否开启
- `title`: 设置文字内容
- `cloud`: 在首页下方显示流动的云
  - `enable`: 是否开启

```ts
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineConfig } from 'valaxy'

export default defineConfig<ThemeConfig>({
  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
      // 手动分割
      // title: ['云游君的', '小站'],
    },
  }
})
```

> 如果您想要更改云的色彩，请更改 `var(--yun-c-cloud)` 的值

```scss
// 新建 styles/vars.css 文件
:root {
  --yun-c-cloud: red;
}
```

新建 `styles/index.ts` 文件，引入 `vars.css`。

```ts
import './vars.css'
```

## 自定义友情链接

新建 `pages/links/index.md` 文件。

您可以在 `frontmatter` 编写链接信息。

- `links`: 友情链接信息（可以是 YAML 数组形式，也可以是一个 JSON 文件链接）
- `random`: 是否随机展示
- `errorImg`: 图片加载失败时的图片链接

譬如：

```md
---
title: 我的小伙伴们
keywords: 链接
description: 云游的小伙伴们
links:
  - url: https://www.yunyoujun.cn
    avatar: https://www.yunyoujun.cn/images/avatar.jpg
    name: 云游君
    blog: 云游君的小站
    desc: 希望能成为一个有趣的人。
    email: me@yunyoujun.cn
    color: "#0078e7"
  - url: https://valaxy.site
    avatar: https://valaxy.site/favicon.svg
    name: Valaxy Org
    blog: Valaxy Site
    desc: 下一代静态博客框架
    email: i@valaxy.site
    color: "#6058d9"
# 也可以是一个 JSON 链接
# links: https://friends.yunyoujun.cn/links.json
random: true
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" errorImg="https://cdn.yunyoujun.cn/img/avatar/none.jpg" />
```

## 样式

### 覆盖背景、侧边栏图片

您可以新建样式文件并引入，以覆盖默认 CSS 变量。

```ts [styles/index.ts]
import './vars.scss'
```

```scss
// styles/vars.scss
:root {
  /* 背景图片 */
  --yun-bg-img: url("https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg");
  /* 侧边栏背景图片 */
  --yun-sidebar-bg-img: url("https://cdn.yunyoujun.cn/img/bg/alpha-stars-timing-1.webp");
}
```
