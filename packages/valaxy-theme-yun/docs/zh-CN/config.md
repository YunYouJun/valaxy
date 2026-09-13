---
title: 主题配置
---

> 📖 完整文档请参见：[valaxy.site/themes/yun](https://valaxy.site/themes/yun)

配置 `valaxy.config.ts` 中的 `themeConfig` 字段，类型可直接参考 [valaxy-theme-yun/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/types/index.d.ts)。

如您需要更详细的描述/示例，再阅读下方内容。

## 主题类型 {#theme-type}

Yun 主题支持两种布局类型，通过 `themeConfig.type` 进行切换。

- `nimbo`（雨云）：默认布局。顶部导航栏 + 首页 Banner 动画 + 全屏菜单（移动端）。
- `strato`（层云）：经典布局。左侧边栏 + 顶部导航栏，类似传统博客风格。

```ts
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineConfig } from 'valaxy'

export default defineConfig<ThemeConfig>({
  theme: 'yun',

  themeConfig: {
    // 'nimbo'（默认）或 'strato'
    type: 'strato',
  }
})
```

::: tip
`strato` 对应 v1 版本的布局风格，`nimbo` 对应 v2 版本的布局风格。

在未来，Yun 主题的不同布局变更将以不同云的名称命名（如 cirro 卷云、cumulo 积云等）。
:::

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


## 首页网格与文章外观

Nimbo 首页网格支持渐隐与鼠标局部提亮，交互默认关闭。网格只覆盖首屏，装饰层不拦截链接；触屏和开启「减少动态效果」时保留静态网格。

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  banner: {
    grid: { enable: true, fade: true, interactive: true },
    prologue: 'grouped', // 可选：收紧介绍分组，保留简介上下两条柔和短线
  },
  postCard: {
    excerptGradient: false,
    titleClass: '', // 使用纯色标题；单篇文章的 postTitleClass 优先
  },
  navbar: { glass: 'always' },
})
```

默认值：网格开启，`fade` / `interactive` 为 `false`；摘要渐隐开启；导航 `glass: 'scroll'`，滚动后显示磨砂。`grid.enable: false` 可关闭网格，Strato 不显示网格。标题方形动画和文章卡片缩放保留，减少动态效果时停用位移动画。

通过 `styles/index.scss` 设置变量即可定制，不需要覆盖组件选择器：

| 变量 | 默认值 / 用途 |
| --- | --- |
| `--yun-prologue-divider-color` | 首页简介上下横线，默认正文颜色；不影响绘制动画 |
| `--yun-banner-divider-color` | 首屏底部分隔线，默认 `--banner-line-color`；不影响开场竖线 |
| `--yun-prologue-divider-width` | grouped 排布的简介横线宽度，默认 `320px`，小屏自动缩小，两端渐隐 |
| `--yun-grid-center-opacity` | 渐隐网格的中心透明度，默认 `1`；降低后内容区域更安静 |
| `--yun-grid-size` | `40px`，网格间距 |
| `--yun-grid-color` | 随明暗模式变化的静态线条颜色 |
| `--yun-grid-highlight-color` | 使用主题色的局部提亮颜色 |
| `--yun-grid-highlight-radius` | `220px`，提亮半径 |
| `--yun-nav-bg-color` / `--yun-nav-solid` | 磨砂底色 / 不支持模糊时的实色底 |
| `--yun-nav-blur` | `12px`，模糊强度 |
| `--yun-nav-border-color` | `transparent`，导航底部分隔线 |
| `--va-card-border-radius` | `0.5rem`，文章卡片圆角 |
| `--yun-post-title-font-family` / `--yun-post-title-font-weight` | 主题衬线字体 / `900` |
| `--yun-post-title-color` / `--yun-post-title-hover-color` | 纯色标题 / hover 颜色；文章类型颜色优先作为默认色 |
| `--yun-post-title-letter-spacing` / `--yun-post-title-line-height` | `normal` / `1.5` |
| `--yun-post-meta-color` | 元信息颜色，默认继承 |
| `--yun-post-excerpt-color` / `--yun-post-excerpt-opacity` | 摘要颜色 / `0.9` |
| `--yun-post-excerpt-line-height` / `--yun-prose-line-height` | 摘要 `1.7` / 正文 `1.8` |
| `--yun-surface-line` | 文章卡片操作区分隔线 |
| `--yun-focus-color` | 键盘焦点颜色，默认链接色 |
| `--yun-say-color` / `--yun-say-font-weight` / `--yun-say-border-color` | 语录文字颜色、字重与分隔线颜色 |

不同明暗配色可分别放在 `:root` 与 `html.dark` 下。主题不统一清除卡片边框或阴影；自定义组件仍可保留自己的材质。若之前用 `.pointer-events-none` 等工具类隐藏摘要遮罩，请改用 `postCard.excerptGradient: false` 并删除旧覆盖。

`banner.prologue` 默认 `classic`，保留原有介绍区横线；`grouped` 使用更紧凑的介绍布局，并保留简介上下两条窄幅分隔线，社交链接与页面导航通过留白分组。两种排布均保留开场动画。


## 本地 Fuse 搜索

`siteConfig.search.provider: 'fuse'` 使用全屏磨砂搜索，保留宽胶囊输入框与衬线文字。结果以淡实线分隔，摘要最多两行。列表底部在仍有结果可滚动时显示 56px 渐变，滚到底或结果不足一屏时取消渐变，保证末条结果完整可读。

弹层基于 Reka UI Dialog：提供无障碍标题和说明、自动聚焦、Tab 焦点循环、Esc 关闭与焦点返回。搜索支持方向键选择和 Enter 跳转，并包含加载失败重试、减少动态效果及减少透明度适配。

搜索结果不展示内部索引或 Score。`refIndex` 是原数据索引，不是相关性分数；真正的 Fuse `score` 需要启用 `includeScore`，只建议用于排查搜索排序，不应解释为匹配百分比。
