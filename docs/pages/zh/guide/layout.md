---
title: 布局
categories:
  - guide
---

框架 API 目前默认支持以下布局，布局支持与最终表现通常与主题有关。

- `post`：文章布局
- `tags`：标签布局
- `archives`：归档布局
- `categories`：分类布局
- `collections`：合集布局

## 使用布局 {#使用布局}

### 合集布局 {#合集布局}

合集允许你将一系列相关文章（如小说、系列教程）组织为一个整体，并提供有序的导航。

#### 目录结构 {#目录结构}

```txt
pages/
  collections/
    index.md              # 合集总览页
    hamster/              # 一个合集
      index.ts            # 合集配置（必需）
      index.md            # 合集入口页
      1.md                # 文章 1
      2.md                # 文章 2
      to-be-or-not.md     # 使用字符串 key 的文章
```

#### 1. 创建总览页 {#创建总览页}

新建 `pages/collections/index.md`，并指定布局为 `collections`：

```md [pages/collections/index.md]
---
layout: collections
icon: i-ri-gallery-view
collections:
  - hamster
  - love-and-peace
---
```

#### 2. 创建合集 {#创建合集}

新建合集文件夹 `pages/collections/hamster/`，包含以下文件：

- `index.ts`：合集配置文件（必需）。
- `index.md`：合集入口页。
- `1.md`、`2.md`、...：合集中的文章。

新建入口页 `pages/collections/hamster/index.md`：

```md [pages/collections/hamster/index.md]
---
layout: collection
---
```

在 `index.ts` 中定义合集配置：

```ts [pages/collections/hamster/index.ts]
import { defineCollection } from 'valaxy'

export default defineCollection({
  key: 'hamster',
  title: '仓鼠',
  cover: 'https://cover.sli.dev',
  description: 'The story of I and She',
  items: [
    { title: '第一章 仓鼠的笼子', key: '1' },
    { title: '第二章 白昼之光，岂知夜色之深。', key: '2' },
    { title: '第三章 作茧自缚', key: '3' },
  ],
})
```

#### 3. 创建文章 {#创建文章}

> `layout: collection` 可省略，`pages/collections/` 目录下的所有文章默认使用 `collection` 布局。

```md [pages/collections/hamster/1.md]
---
title: 第一章 仓鼠的笼子
---

你的文章内容。
```

效果预览：[合集 | Valaxy Theme Yun](https://yun.valaxy.site/collections/hamster/1)

### CollectionConfig {#collection-config}

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `string` | 目录名 | 唯一标识符。未指定时自动从目录名派生。 |
| `title` | `string` | — | 合集显示标题。 |
| `cover` | `string` | — | 封面图 URL。 |
| `description` | `string` | — | 简短描述。 |
| `categories` | `string[]` | — | 合集卡片的分类。 |
| `tags` | `string[]` | — | 合集卡片的标签。 |
| `collapse` | `boolean` | `true` | 是否在首页/归档文章列表中以单个折叠卡片展示。详见[折叠模式](#折叠模式)。 |
| `items` | `{ title?, key?, link? }[]` | — | 有序文章列表。`key` 对应 `.md` 文件名（如 `key: '1'` → `1.md`）。`link` 引用已有页面或外部 URL。`key` 与 `link` 互斥，若同时设置，`link` 优先。决定文章阅读顺序和上下篇导航。 |

### 折叠模式 {#折叠模式}

::: tip
`collapse` 为实验性功能，自 `v0.28.0` 起可用。
:::

当 `collapse` 为 `true`（默认）时，合集在首页和归档文章列表中显示为**一张卡片**。由于合集文章位于 `/collections/` 路径下，它们不会单独出现在文章列表中——折叠卡片提供了进入合集的便捷入口。

```ts
export default defineCollection({
  title: '我的系列',
  collapse: true, // 默认 — 显示为一张卡片
  items: [/* ... */],
})
```

当 `collapse` 为 `false` 时，不会在文章列表中添加合集条目。

```ts
export default defineCollection({
  title: '我的系列',
  collapse: false, // 不在文章列表中显示卡片
  items: [/* ... */],
})
```

### 链接外部内容 {#链接外部内容}

你可以使用 `link` 字段在合集的阅读顺序中引用已有的博客文章或外部 URL。当合集包含不在合集目录中的内容时，这个功能非常有用。

- 内部链接（以 `/` 开头）通过 `<RouterLink>` 在站内导航。
- 外部链接（如 `https://...`）在新标签页中打开，并显示外部链接图标。
- `key` 与 `link` 互斥。若同时设置，`link` 优先。

```ts
export default defineCollection({
  title: '我的学习路径',
  items: [
    { title: '第一章 - 基础', key: '1' },
    { title: '相关博文', link: '/posts/my-related-article' },
    { title: '第二章 - 进阶', key: '2' },
    { title: '外部参考', link: 'https://example.com/resource' },
  ],
})
```

## 实现布局（主题开发者） {#实现布局}

[valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 自 `v0.25.9` 起支持 `collections` 布局。

按约定，主题需要在 `layouts` 目录下创建对应的布局文件，文件名与布局名称相同。

在主题中，你可以使用以下合集相关 API：

- `useCollections()` — 获取所有合集配置。
- `useCollection()` — 获取当前合集（根据路由路径判断）。
- `useCollectionPosts(key)` — 获取指定合集的文章列表，按 `items` 定义的顺序排列。
- `usePostListWithCollections()` — 获取合并了折叠合集条目的文章列表。

<<< @/../packages/valaxy-theme-yun/layouts/collections.vue

## FAQ {#faq}

### 子页面发生了多层布局嵌套 {#child-pages-with-multiple-layout-nesting}

Vue Router 的页面会自动嵌套父级布局，请参考 [Nested Routes | Unplugin Vue Router](https://uvr.esm.is/guide/file-based-routing#nested-routes)。

例如将：

`pages/users/create.vue` 修改为 `pages/users.create.vue`。
