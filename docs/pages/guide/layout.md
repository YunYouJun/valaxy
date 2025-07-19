---
title:
  en: Layout
  zh-CN: 布局
categories:
  - guide
---

框架 API 目前默认支持以下布局，布局支持与最终表现通常与主题有关。

- `post`：文章布局
- `tags`：标签布局
- `archives`：归档布局
- `categories`：分类布局
- `collections`：合集布局

## 使用布局

### 合集布局

新建总览页 `pages/collections/index.md`，并指定布局为 `collections`。

- `collections`: 合集列表，须指定唯一合集 ID。

```md [pages/collections/index.md]
---
layout: collections
icon: i-ri-gallery-view
collections:
  - hamster
  - love-and-peace
---
```

新建合集文件夹 `pages/collections/hamster/`：

- `index.md`：合集总览页，指定布局为 `collection`。
- `index.ts`：合集配置文件。
- `1.md`：合集中的第一篇文章。

新建合集入口页 `pages/collections/hamster/index.md`，并指定布局为 `collection`。

```md [pages/collections/hamster/index.md]
---
layout: collection
---
```

定义当前合集信息：

```ts [pages/collections/hamster/index.ts]
import { defineCollection } from 'valaxy'

export default defineCollection({
  key: 'hamster',
  title: '仓鼠',
  cover: 'https://cover.sli.dev',
  description: 'The story of I and She',
  items: [
    {
      title: '第一章 仓鼠的笼子',
      // 文章唯一索引，对应路径为 `pages/collections/hamster/1.md`
      key: '1',
    },
    {
      title: '第二章 白昼之光，岂知夜色之深。',
      key: '2',
    },
    {
      title: '第三章 作茧自缚',
      key: '3',
    },
  ]
})
```

新建合集中文章：

> `layout: collection` 可省略，`pages/collections/` 目录下的所有文章默认使用 `collection` 布局。

```md [pages/collections/hamster/1.md]
---
title: 第一章 仓鼠的笼子
layout: collection
---
```

效果预览：[合集｜Valaxy Theme Yun](https://yun.valaxy.site/collections/hamster/1)

## 实现布局

如 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 自 `v0.25.9` 支持了 `collections` 布局。

按约定，主题需要在 `layouts` 目录下创建对应的布局文件，文件名与布局名称相同。

在主题中，你可以使用以下合集相关 API。

- `useCollections` API 获取合集列表。
- `useCollection` API 获取单个合集（根据路径判断当前合集 ID）。

<<< @/../packages/valaxy-theme-yun/layouts/collections.vue
